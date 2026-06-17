import ky, {
  type HTTPError,
  type Hooks,
  type KyInstance,
  type KyResponse,
  type Options,
} from "ky";
import {
  isApiErrorResponse,
  isApiSuccessResponse,
} from "@fuel-carrier/shared-types";
import { ApiClientError } from "./api-client-error";

export function createApiClient({
  prefixUrl,
  credentials = "include",
  timeout = 30_000,
  hooks,
}: CreateApiClientOptions): KyInstance {
  return ky.create({
    prefixUrl,
    credentials,
    timeout,
    headers: {
      Accept: "application/json",
    },
    hooks: createEnvelopeHooks(hooks),
  });
}

export type CreateApiClientOptions = {
  prefixUrl: string;
} & Pick<Options, "credentials" | "hooks" | "timeout">;

function createEnvelopeHooks(userHooks?: Hooks): Hooks {
  return {
    ...userHooks,
    afterResponse: [unwrapSuccessResponse, ...(userHooks?.afterResponse ?? [])],
    beforeError: [...(userHooks?.beforeError ?? []), transformApiError],
  };
}

async function unwrapSuccessResponse(
  _request: Request,
  _options: unknown,
  response: KyResponse,
): Promise<KyResponse> {
  if (!response.ok) {
    return response;
  }

  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return response;
  }

  const body: unknown = await response
    .clone()
    .json()
    .catch(function onParseError() {
      return null;
    });

  if (!isApiSuccessResponse(body)) {
    return response;
  }

  return new Response(JSON.stringify(body.data), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

async function transformApiError(error: HTTPError): Promise<HTTPError> {
  const body: unknown = await error.response
    .json()
    .catch(function onParseError() {
      return null;
    });

  if (isApiErrorResponse(body)) {
    throw new ApiClientError(body.error, error.response.status);
  }

  return error;
}

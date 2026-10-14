import { useI18nContext } from "@fuel-carrier/i18n/react";
import {
  CompanyUserLevels,
  type CompanyUserLevel,
} from "@fuel-carrier/shared-types";
import {
  NOTIFICATION_BODY_MAX_LENGTH,
  NOTIFICATION_COMPANIES_NOT_FOUND_MESSAGE,
  NOTIFICATION_MAX_COMPANIES,
  NOTIFICATION_TITLE_MAX_LENGTH,
  NotificationChannels,
  readNoMatchingStaffCompanyName,
  type SendNotificationDto,
} from "@fuel-carrier/shared-types/notification";
import { createSendNotificationSchema } from "@fuel-carrier/shared-validation/notification/send";
import {
  applyApiFieldErrors,
  isApiClientError,
} from "@fuel-carrier/web-ui/api";
import { zodResolver, useForm, useWatch } from "@fuel-carrier/web-ui/form";
import { useMutation, useQueryClient } from "@fuel-carrier/web-ui/query";
import { useToast } from "@fuel-carrier/web-ui/ui";
import { useMemo, useState } from "react";
import {
  notificationKeys,
  sendNotification,
} from "../../lib/api/notifications";
import type { SelectedCompany } from "./CompanyAudiencePicker";

export const STAFF_LEVELS = [
  CompanyUserLevels.ADMIN,
  CompanyUserLevels.VIEWER,
] as const;

const fieldMessage = (error: { message?: unknown } | undefined) =>
  typeof error?.message === "string" ? error.message : undefined;

export function useSendNotificationForm(onSent: () => void) {
  const { LL } = useI18nContext();
  const copy = LL.internalPanel.notifications;
  const toast = useToast();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<SelectedCompany[]>(
    [],
  );
  const schema = useMemo(
    function createSchema() {
      return createSendNotificationSchema({
        titleRequired: LL.validation.notificationTitleRequired(),
        titleTooLong: LL.validation.notificationTitleTooLong({
          max: NOTIFICATION_TITLE_MAX_LENGTH,
        }),
        bodyRequired: LL.validation.notificationBodyRequired(),
        bodyTooLong: LL.validation.notificationBodyTooLong({
          max: NOTIFICATION_BODY_MAX_LENGTH,
        }),
        companiesRequired: LL.validation.notificationCompaniesRequired(),
        companiesTooMany: LL.validation.notificationCompaniesTooMany({
          max: NOTIFICATION_MAX_COMPANIES,
        }),
        levelsRequired: LL.validation.notificationLevelsRequired(),
      });
    },
    [LL],
  );
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      channel: NotificationChannels.BROWSER,
      title: "",
      body: "",
      companyIds: [] as string[],
      levels: [...STAFF_LEVELS] as CompanyUserLevel[],
    },
  });
  const levels = useWatch({ control: form.control, name: "levels" });
  const sendMutation = useMutation({
    mutationFn: sendNotification,
  });

  function handleCompaniesChange(companies: SelectedCompany[]) {
    setSelectedCompanies(companies);
    form.setValue(
      "companyIds",
      companies.map((company) => company.id),
      { shouldValidate: true },
    );
  }

  function handleToggleLevel(level: CompanyUserLevel) {
    const next = levels.includes(level)
      ? levels.filter((item) => item !== level)
      : [...levels, level];
    form.setValue("levels", next, { shouldValidate: true });
  }

  function handleFormError(error: unknown) {
    if (isApiClientError(error)) {
      const missingStaffNames = (error.apiError.fields ?? [])
        .map((fieldError) => readNoMatchingStaffCompanyName(fieldError.message))
        .filter((companyName) => companyName != null);

      if (missingStaffNames.length > 0) {
        form.setError("companyIds", {
          message: LL.validation.notificationNoMatchingStaff({
            names: missingStaffNames.join(", "),
          }),
        });
        return;
      }

      const missingCompany = error.apiError.fields?.find(
        function findMissingCompany(fieldError) {
          return (
            fieldError.field === "companyIds" &&
            fieldError.message === NOTIFICATION_COMPANIES_NOT_FOUND_MESSAGE
          );
        },
      );
      if (missingCompany) {
        form.setError("companyIds", {
          message: LL.validation.notificationCompaniesNotFound(),
        });
        return;
      }
    }

    const banner = applyApiFieldErrors({
      error,
      setError: form.setError,
      fields: ["title", "body", "companyIds", "levels", "channel"],
      fallbackMessage: copy.sendFailed(),
    });
    setServerError(banner);
  }

  async function handleSubmit(data: SendNotificationDto) {
    setServerError(null);

    try {
      const sent = await sendMutation.mutateAsync(data);
      toast.success(
        LL.internalPanel.toast.notificationSent({ count: sent.recipientCount }),
      );
      form.reset();
      setSelectedCompanies([]);
      await queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      onSent();
    } catch (error) {
      handleFormError(error);
    }
  }

  return {
    form,
    levels,
    selectedCompanies,
    serverError,
    isSending: sendMutation.isPending,
    companyError: fieldMessage(form.formState.errors.companyIds),
    levelError: fieldMessage(form.formState.errors.levels),
    handleSubmit,
    handleCompaniesChange,
    handleToggleLevel,
  };
}

import { useMemo, useState } from "react";
import type { CompanyUser } from "@fuel-carrier/shared-types";
import { useI18nContext } from "@fuel-carrier/i18n/react";
import { isApiClientError } from "@fuel-carrier/web-ui/api";
import {
  zodResolver,
  useForm,
  type SubmitHandler,
  type UseFormReturn,
} from "@fuel-carrier/web-ui/form";
import { useMutation } from "@fuel-carrier/web-ui/query";
import { useToast } from "@fuel-carrier/web-ui/ui";
import {
  companyUserToFormValues,
  createCompanyUser,
  updateCompanyUser,
} from "../../../lib/api/company-users";
import {
  companyUserCreateFormSchema,
  companyUserEditFormSchema,
  type CompanyUserFormInput,
  type CompanyUserFormModalMode,
  type CompanyUserFormOutput,
} from "./company-user-form.schema";

interface UseCompanyUserFormModalOptions {
  mode: CompanyUserFormModalMode;
  companyId: string;
  user?: CompanyUser;
  onClose: () => void;
  onSuccess: () => void;
}

interface UseCompanyUserFormModalResult {
  form: UseFormReturn<CompanyUserFormInput, unknown, CompanyUserFormOutput>;
  serverError: string | null;
  isSaving: boolean;
  title: string;
  confirmLabel: string;
  onSubmit: SubmitHandler<CompanyUserFormOutput>;
  handleClose: () => void;
}

export function useCompanyUserFormModal({
  mode,
  companyId,
  user,
  onClose,
  onSuccess,
}: UseCompanyUserFormModalOptions): UseCompanyUserFormModalResult {
  const { LL } = useI18nContext();
  const toast = useToast();
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = useMemo(
    function createSchema() {
      return mode === "edit"
        ? companyUserEditFormSchema
        : companyUserCreateFormSchema;
    },
    [mode],
  );

  const form = useForm<CompanyUserFormInput, unknown, CompanyUserFormOutput>({
    resolver: zodResolver(schema),
    defaultValues: companyUserToFormValues(user),
  });

  const {
    setError,
    formState: { isSubmitting },
  } = form;

  const saveMutation = useMutation({
    mutationFn: async function saveCompanyUser({
      nationalId,
      email,
      password,
      ...restOfData
    }: CompanyUserFormOutput) {
      const payload = {
        ...restOfData,
        nationalId: nationalId || null,
        email: email || null,
      };

      if (mode === "edit" && user) {
        return updateCompanyUser(user.id, {
          ...payload,
          ...(password ? { password } : {}),
        });
      }

      return createCompanyUser({
        ...payload,
        companyId,
        password,
      });
    },
    onSuccess: function handleSaveSuccess() {
      toast.success(
        mode === "edit"
          ? LL.internalPanel.toast.userUpdated()
          : LL.internalPanel.toast.userCreated(),
      );
      onSuccess();
      onClose();
    },
  });

  const onSubmit: SubmitHandler<CompanyUserFormOutput> =
    async function onSubmit(data) {
      setServerError(null);

      try {
        await saveMutation.mutateAsync(data);
      } catch (error) {
        handleFormError(error);
      }
    };

  function handleFormError(error: unknown) {
    if (isApiClientError(error)) {
      if (error.apiError.fields?.length) {
        for (const fieldError of error.apiError.fields) {
          if (
            fieldError.field === "firstName" ||
            fieldError.field === "lastName" ||
            fieldError.field === "username" ||
            fieldError.field === "password" ||
            fieldError.field === "nationalId" ||
            fieldError.field === "email" ||
            fieldError.field === "level"
          ) {
            setError(fieldError.field, { message: fieldError.message });
          }
        }
      }

      if (error.apiError.fields?.some((field) => field.field === "username")) {
        setServerError(LL.internalPanel.companies.detail.duplicateUsername());
        return;
      }

      if (
        error.apiError.fields?.some((field) => field.field === "nationalId")
      ) {
        setServerError(LL.internalPanel.companies.detail.duplicateNationalId());
        return;
      }

      setServerError(error.apiError.message);
      return;
    }

    setServerError(LL.internalPanel.companies.detail.createFailed());
  }

  function handleClose() {
    if (!isSubmitting && !saveMutation.isPending) {
      onClose();
    }
  }

  const isSaving = isSubmitting || saveMutation.isPending;
  const title =
    mode === "edit"
      ? LL.internalPanel.companies.detail.userEditTitle()
      : LL.internalPanel.companies.detail.userCreateTitle();

  const confirmLabel =
    mode === "edit"
      ? LL.internalPanel.companies.update()
      : LL.internalPanel.companies.detail.addUser();

  return {
    form,
    serverError,
    isSaving,
    title,
    confirmLabel,
    onSubmit,
    handleClose,
  };
}

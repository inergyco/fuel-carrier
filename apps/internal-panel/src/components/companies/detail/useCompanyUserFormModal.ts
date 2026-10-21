import { useMemo, useState } from "react";
import type { CompanyUser } from "@fuel-carrier/shared-types";
import { useI18nContext } from "@fuel-carrier/i18n/react";
import { applyApiFieldErrors } from "@fuel-carrier/web-ui/api";
import {
  zodResolver,
  useForm,
  useWatch,
  toCompanyUserValidationMessages,
  type SubmitHandler,
  type UseFormReturn,
} from "@fuel-carrier/web-ui/form";
import { useMutation } from "@fuel-carrier/web-ui/query";
import { useToast } from "@fuel-carrier/web-ui/ui";
import {
  companyUserToFormValues,
  createCompanyUser,
  discardCompanyUserImage,
  removeCompanyUserImage,
  replaceCompanyUserImage,
  updateCompanyUser,
  uploadCompanyUserImage,
} from "../../../lib/api/company-users";
import {
  createCompanyUserFormSchemaPair,
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
  imageUrl: string | null;
  imageError?: string;
  onUploadImage: (file: File) => Promise<void>;
  onRemoveImage: () => Promise<void>;
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
      const schemas = createCompanyUserFormSchemaPair(
        toCompanyUserValidationMessages(LL),
      );

      return mode === "edit" ? schemas.editSchema : schemas.createSchema;
    },
    [LL, mode],
  );

  const form = useForm<CompanyUserFormInput, unknown, CompanyUserFormOutput>({
    resolver: zodResolver(schema),
    defaultValues: companyUserToFormValues(user),
  });

  const {
    setError,
    control,
    setValue,
    formState: { isSubmitting, errors },
  } = form;
  const imageUrlValue = useWatch({ control, name: "imageUrl" });
  const imageUrl =
    typeof imageUrlValue === "string" && imageUrlValue.length > 0
      ? imageUrlValue
      : null;

  const saveMutation = useMutation({
    mutationFn: async function saveCompanyUser({
      nationalId,
      email,
      password,
      imageUrl: nextImageUrl,
      ...restOfData
    }: CompanyUserFormOutput) {
      const payload = {
        ...restOfData,
        nationalId: nationalId || null,
        email: email || null,
      };

      if (mode === "edit" && user) {
        await syncCompanyUserImage(user, nextImageUrl ?? null);

        return updateCompanyUser(user.id, {
          ...payload,
          ...(password ? { password } : {}),
        });
      }

      return createCompanyUser({
        ...payload,
        companyId,
        password,
        imageUrl: nextImageUrl ?? null,
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

  async function onUploadImage(file: File) {
    const uploaded = await uploadCompanyUserImage(file);
    const previousImageUrl = imageUrl;
    setValue("imageUrl", uploaded.imageUrl, {
      shouldDirty: true,
      shouldValidate: true,
    });
    await discardUnsavedImage(previousImageUrl, user?.imageUrl);
  }

  async function onRemoveImage() {
    await discardUnsavedImage(imageUrl, user?.imageUrl);
    setValue("imageUrl", "", { shouldDirty: true, shouldValidate: true });
  }

  function handleFormError(error: unknown) {
    setServerError(
      applyApiFieldErrors({
        error,
        setError,
        fields: [
          "firstName",
          "lastName",
          "username",
          "password",
          "nationalId",
          "email",
          "imageUrl",
          "level",
        ],
        messages: {
          username: () =>
            LL.internalPanel.companies.detail.duplicateUsername(),
          nationalId: () =>
            LL.internalPanel.companies.detail.duplicateNationalId(),
        },
        fallbackMessage: LL.internalPanel.companies.detail.createFailed(),
      }),
    );
  }

  async function handleClose() {
    if (isSubmitting || saveMutation.isPending) {
      return;
    }

    await discardUnsavedImage(imageUrl, user?.imageUrl);
    onClose();
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
    imageUrl,
    imageError: errors.imageUrl?.message?.toString(),
    onUploadImage,
    onRemoveImage,
    onSubmit,
    handleClose,
  };
}

async function discardUnsavedImage(
  imageUrl: string | null,
  savedImageUrl: string | null | undefined,
) {
  if (!imageUrl || imageUrl === (savedImageUrl ?? null)) {
    return;
  }

  await discardCompanyUserImage(imageUrl);
}

async function syncCompanyUserImage(
  user: CompanyUser,
  nextImageUrl: string | null,
) {
  const previousImageUrl = user.imageUrl ?? null;
  if (nextImageUrl === previousImageUrl) {
    return;
  }

  if (nextImageUrl === null) {
    await removeCompanyUserImage(user.id);
    return;
  }

  await replaceCompanyUserImage(user.id, nextImageUrl);
}

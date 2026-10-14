import { useI18nContext } from "@fuel-carrier/i18n/react";
import {
  CompanyUserLevels,
  type CompanyUserLevel,
} from "@fuel-carrier/shared-types";
import {
  NOTIFICATION_BODY_MAX_LENGTH,
  NOTIFICATION_TITLE_MAX_LENGTH,
  NotificationChannels,
} from "@fuel-carrier/shared-types/notification";
import { Form } from "@fuel-carrier/web-ui/form";
import {
  Button,
  Checkbox,
  FieldsetLegend,
  FormInput,
  FormTextarea,
  RadioOption,
} from "@fuel-carrier/web-ui/ui";
import { CompanyAudiencePicker } from "./CompanyAudiencePicker";
import {
  STAFF_LEVELS,
  useSendNotificationForm,
} from "./useSendNotificationForm";

interface SendNotificationFormProps {
  onSent: () => void;
}

export function SendNotificationForm({ onSent }: SendNotificationFormProps) {
  const { LL } = useI18nContext();
  const copy = LL.internalPanel.notifications;
  const {
    form,
    levels,
    selectedCompanies,
    serverError,
    isSending,
    companyError,
    levelError,
    handleSubmit,
    handleCompaniesChange,
    handleToggleLevel,
  } = useSendNotificationForm(onSent);

  function levelLabel(level: CompanyUserLevel): string {
    return level === CompanyUserLevels.ADMIN
      ? LL.common.companyUserLevel.admin()
      : LL.common.companyUserLevel.viewer();
  }

  return (
    <section className="rounded-2xl border border-base-content/8 bg-panel-card p-4 backdrop-blur-sm md:p-6">
      <h2 className="text-base font-medium tracking-tight">
        {copy.composeTitle()}
      </h2>
      <p className="mt-1 text-sm text-base-content/50">{copy.composeHint()}</p>

      <Form
        className="mt-5 flex flex-col gap-5"
        form={form}
        onSubmit={handleSubmit}
      >
        <FormInput
          name="title"
          label={copy.titleLabel()}
          placeholder={copy.titlePlaceholder()}
          maxLength={NOTIFICATION_TITLE_MAX_LENGTH}
        />
        <FormTextarea
          name="body"
          label={copy.bodyLabel()}
          placeholder={copy.bodyPlaceholder()}
          maxLength={NOTIFICATION_BODY_MAX_LENGTH}
          rows={5}
        />

        <fieldset className="flex flex-col gap-2">
          <FieldsetLegend description={copy.channelHint()}>
            {copy.channelLabel()}
          </FieldsetLegend>
          <RadioOption
            title={copy.channelBrowser()}
            description={copy.channelBrowserDescription()}
            value={NotificationChannels.BROWSER}
            {...form.register("channel")}
          />
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <FieldsetLegend description={copy.levelsHint()}>
            {copy.levelsLabel()}
          </FieldsetLegend>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            {STAFF_LEVELS.map(function renderLevel(level) {
              const inputId = `notification-level-${level}`;
              return (
                <label
                  key={level}
                  htmlFor={inputId}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2.5"
                >
                  <Checkbox
                    id={inputId}
                    checked={levels.includes(level)}
                    onChange={function toggleLevel() {
                      handleToggleLevel(level);
                    }}
                  />
                  <span className="text-sm text-base-content/80">
                    {levelLabel(level)}
                  </span>
                </label>
              );
            })}
          </div>
          {levelError ? (
            <p className="text-xs text-error/80" role="alert">
              {levelError}
            </p>
          ) : null}
        </fieldset>

        <CompanyAudiencePicker
          selected={selectedCompanies}
          onChange={handleCompaniesChange}
          error={companyError}
        />

        {serverError ? (
          <p className="text-sm text-error" role="alert">
            {serverError}
          </p>
        ) : null}

        <Button
          type="submit"
          className="sm:max-w-xs"
          loading={isSending}
          loadingText={copy.sending()}
        >
          {copy.send()}
        </Button>
      </Form>
    </section>
  );
}

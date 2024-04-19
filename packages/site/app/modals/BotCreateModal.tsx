import { DiscordErrorData } from "@discordjs/rest";
import { Form, useActionData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "~/components/Button";
import { useError } from "~/components/Error";
import { TextInput } from "~/components/TextInput";
import { linkClassName } from "~/components/preview/Markdown";
import { action } from "~/routes/me";
import { RESTGetAPIApplicationRpcResult } from "~/types/discord";
import { cdn, getApplicationRpc } from "~/util/discord";
import { Modal, ModalProps } from "./Modal";

export const BotCreateModal = (props: ModalProps) => {
  const { t } = useTranslation();
  const actionData = useActionData<typeof action>();
  const [error, setError] = useError();
  const [application, setApplication] =
    useState<RESTGetAPIApplicationRpcResult>();

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    if (!props.open) {
      setError(undefined);
      setApplication(undefined);
    }
  }, [props.open]);

  useEffect(() => {
    if (actionData?.action === "CREATE_BOT") {
      props.setOpen(false);
    }
  }, [actionData, props.setOpen]);

  return (
    <Modal title={t("createBot.title")} {...props}>
      <Form action="/me" method="POST">
        {error}
        <input name="action" value="CREATE_BOT" readOnly hidden />
        <div>
          {/* <p>
            How to create an application:
          </p> */}
          <ul className="list-decimal list-inside mb-2">
            <li>
              <Trans
                t={t}
                i18nKey="createBot.step1"
                components={[
                  // biome-ignore lint/a11y/useAnchorContent: Content provided in render
                  <a
                    href="https://discord.com/developers/applications"
                    className={linkClassName}
                    target="_blank"
                    rel="noreferrer"
                  />,
                ]}
              />
            </li>
            <li>{t("createBot.step2")}</li>
            <li>{t("createBot.step3")}</li>
            <li>{t("createBot.step4")}</li>
          </ul>
          <TextInput
            name="applicationId"
            label="Application ID"
            className="w-full"
            pattern="^\d{17,22}$"
            onChange={async ({ currentTarget }) => {
              setApplication(undefined);
              setError(undefined);
              if (/^\d{17,22}$/.test(currentTarget.value)) {
                try {
                  const app = await getApplicationRpc(currentTarget.value);
                  if (!app.id) {
                    setError({
                      message: (app as unknown as DiscordErrorData).message,
                    });
                    return;
                  }
                  setApplication(app);
                } catch (e) {
                  setError({ message: String(e) });
                }
              }
            }}
          />
        </div>
        <div className="mt-4 rounded-lg p-3 bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22] flex">
          {application ? (
            <>
              <img
                className="rounded-full my-auto w-8 h-8 mr-3"
                src={
                  application.icon
                    ? cdn.appIcon(application.id, application.icon, {
                        size: 64,
                      })
                    : cdn.defaultAvatar(5)
                }
                alt={application.name}
              />
              <div className="truncate my-auto">
                <div className="flex max-w-full">
                  <p className="font-semibold truncate dark:text-primary-230 text-base">
                    {application.name}
                  </p>
                </div>
                <p className="text-gray-600 dark:text-gray-500 text-xs">
                  {application.description || (
                    <span className="italic">No description</span>
                  )}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-full my-auto w-8 h-8 mr-3 bg-gray-400 dark:bg-gray-600" />
              <div className="my-auto">
                <div className="rounded-full truncate bg-gray-400 dark:bg-gray-600 w-36 h-4" />
              </div>
            </>
          )}
        </div>
        <div className="flex w-full mt-4">
          <Button type="submit" disabled={!application} className="mx-auto">
            {t("create")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

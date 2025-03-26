import { Form } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/Button";
import { TextInput } from "~/components/TextInput";
import type { LoadedBot } from "~/routes/me";
import { botAppAvatar } from "~/util/discord";
import { Modal, type ModalProps } from "./Modal";

export const BotDeleteConfirmModal = (
  props: ModalProps & {
    bot: LoadedBot | undefined;
  },
) => {
  const { t } = useTranslation();
  const { bot } = props;
  const [matches, setMatches] = useState(false);

  return (
    <Modal title={t("deleteBot.title")} {...props}>
      <Form
        action={`/me/bots/${bot?.id}`}
        method="DELETE"
        replace
        onSubmit={(e) => {
          if (!matches) {
            e.preventDefault();
            return;
          }
          setMatches(false);
        }}
      >
        <div className="mb-4 rounded-lg p-3 bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22] flex">
          {bot ? (
            <>
              <img
                className="rounded-full my-auto w-8 h-8 ltr:mr-3 rtl:ml-3"
                src={botAppAvatar(bot, { size: 64 })}
                alt={bot.name}
              />
              <div className="truncate my-auto">
                <div className="flex max-w-full">
                  <p className="font-semibold truncate dark:text-primary-230 text-base">
                    {bot.name}
                  </p>
                </div>
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
        <input name="action" value="DELETE_BOT" readOnly hidden />
        <p className="mb-2">{t("deleteBot.note")}</p>
        {bot && (
          <>
            <input name="botId" value={String(bot.id)} readOnly hidden />
            <TextInput
              name="name"
              label={t("botName")}
              className="w-full"
              onChange={(e) => setMatches(e.currentTarget.value === bot.name)}
            />
          </>
        )}
        <div className="flex w-full mt-4">
          <Button
            type="submit"
            disabled={!bot || !matches}
            discordstyle={ButtonStyle.Danger}
            className="mx-auto"
          >
            {t("delete")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

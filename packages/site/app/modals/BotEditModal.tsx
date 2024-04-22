import { Form, useSubmit } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import React, { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { AsyncGuildSelect, OptionGuild } from "~/components/AsyncGuildSelect";
import { Button } from "~/components/Button";
import { useError } from "~/components/Error";
import { TextInput } from "~/components/TextInput";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { LoadedBot, MeLoadedMembership } from "~/routes/me";
import { User } from "~/session.server";
import { DISCORD_BOT_TOKEN_RE, botAppAvatar } from "~/util/discord";
import { copyText } from "~/util/text";
import { getUserTag } from "~/util/users";
import { BotDeleteConfirmModal } from "./BotDeleteConfirmModal";
import { Modal, ModalProps } from "./Modal";

export const BotEditModal = (
  props: Omit<ModalProps, "open" | "setOpen"> & {
    user: User;
    memberships: Promise<MeLoadedMembership[]>;
    bot: LoadedBot | undefined;
    setBot: React.Dispatch<React.SetStateAction<LoadedBot | undefined>>;
  },
) => {
  const { t } = useTranslation();
  const { bot, setBot, memberships } = props;
  const submit = useSubmit();
  const [error, setError] = useError();
  const [guild, setGuild] = useState<OptionGuild>();
  const [delConfirm, setDelConfirm] = useState(false);

  const open = !!bot;
  const setOpen = (_: boolean) => {
    setBot(undefined);
    setError(undefined);
    setGuild(undefined);
    setDelConfirm(false);
  };

  useEffect(() => {
    if (open && bot?.guildId) {
      memberships.then((ships) => {
        const g = ships.find(
          (m) => String(m.guild.id) === String(bot.guildId),
        )?.guild;
        if (g) {
          setGuild(g);
        }
      });
    }
  }, [open, bot, memberships]);

  return (
    <Modal title={t("updateBot")} open={open} setOpen={setOpen}>
      <BotDeleteConfirmModal
        open={delConfirm}
        setOpen={setDelConfirm}
        setParentOpen={setOpen}
        bot={bot}
      />
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          if (
            form.get("token") &&
            !DISCORD_BOT_TOKEN_RE.test(form.get("token")?.toString() ?? "")
          ) {
            setError({ message: "Invalid token" });
            return;
          }
          if (!form.get("guildId")) {
            form.set("guildId", "null");
          }
          submit(form, { method: "PATCH", action: "/me" });
          setOpen(false);
        }}
      >
        {error}
        <div className="mb-4 rounded-lg p-3 bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22] flex">
          {bot ? (
            <>
              <img
                className="rounded-full my-auto w-8 h-8 mr-3"
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
              <a
                className="block ml-auto my-auto"
                href={`https://discord.com/developers/applications/${bot.applicationId}/information`}
                target="_blank"
                rel="noreferrer"
              >
                <Button discordstyle={ButtonStyle.Link} className="text-sm">
                  {t("portal")}
                </Button>
              </a>
              <Button
                discordstyle={ButtonStyle.Danger}
                className="text-sm ml-1"
                onClick={() => setDelConfirm(true)}
                emoji={{ name: "🗑️" }}
              />
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
        <input name="action" value="UPDATE_BOT" readOnly hidden />
        {bot && (
          <>
            <input name="botId" value={String(bot.id)} readOnly hidden />
            <div>
              {bot.hasToken ? (
                <div>
                  <p className="text-sm font-medium">
                    <Trans
                      t={t}
                      i18nKey="botTokenCheck"
                      components={[
                        <CoolIcon
                          icon="Check_Big"
                          className="text-green-300"
                        />,
                      ]}
                    />
                  </p>
                  <p>{t("botTokenHiddenNote")}</p>
                  <Button
                    className="mt-1 text-sm"
                    onClick={() => {
                      submit(
                        {
                          action: "UPDATE_BOT",
                          botId: String(bot.id),
                          token: "null",
                        },
                        {
                          method: "PATCH",
                          action: "/me",
                        },
                      );
                      setBot({ ...bot, hasToken: false });
                    }}
                  >
                    {t("botClearToken")}
                  </Button>
                </div>
              ) : (
                <div>
                  <TextInput
                    name="token"
                    label={
                      <Trans
                        t={t}
                        i18nKey="botTokenCheck"
                        components={[
                          <CoolIcon icon="Close_MD" className="text-red-400" />,
                        ]}
                      />
                    }
                    className="w-full"
                    // pattern={escapeRegex(DISCORD_BOT_TOKEN_RE)}
                    type="password"
                    onBlur={(e) => {
                      e.currentTarget.type = "password";
                    }}
                    onFocus={(e) => {
                      e.currentTarget.type = "text";
                    }}
                  />
                  <p className="mt-1 text-sm">
                    {t("botNoTokenNote")}{" "}
                    {t("botTokenOwnerWarning", {
                      replace: { username: getUserTag(props.user) },
                    })}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-2">
              <p className="text-sm font-medium">{t("server_one")}</p>
              <AsyncGuildSelect
                name="guildId"
                isClearable
                guilds={(async () =>
                  (await memberships)
                    .filter((m) =>
                      new PermissionsBitField(BigInt(m.permissions)).has(
                        PermissionFlags.ManageGuild,
                      ),
                    )
                    .map((m) => m.guild))()}
                value={guild ?? null}
                onChange={(g) => setGuild(g ?? undefined)}
              />
            </div>
            <div className="mt-2 flex">
              <div className="grow">
                <TextInput
                  label={t("botInteractionUrl")}
                  className="w-full"
                  value={bot.url}
                  readOnly
                />
              </div>
              <Button
                onClick={() => {
                  copyText(bot.url);
                }}
                className="ml-2 mt-auto"
              >
                {t("copy")}
              </Button>
            </div>
          </>
        )}
        <div className="flex w-full mt-4">
          <Button type="submit" disabled={!bot} className="ml-auto">
            {t("save")}
          </Button>
          <a
            href={
              !guild || !bot
                ? ""
                : `https://discord.com/oauth2/authorize/?${new URLSearchParams({
                    client_id: bot.applicationId.toString(),
                    guild_id: guild.id.toString(),
                    scope: "bot",
                  })}`
            }
            className="block ml-1 mr-auto"
            target="_blank"
            rel="noreferrer"
          >
            <Button discordstyle={ButtonStyle.Link} disabled={!guild}>
              {t("inviteBot")}
            </Button>
          </a>
        </div>
      </Form>
    </Modal>
  );
};

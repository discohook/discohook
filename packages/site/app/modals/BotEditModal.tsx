import { Form, useSubmit } from "@remix-run/react";
import { ButtonStyle } from "discord-api-types/v10";
import { PermissionFlags, PermissionsBitField } from "discord-bitflag";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AsyncGuildSelect, OptionGuild } from "~/components/AsyncGuildSelect";
import { Button } from "~/components/Button";
import { useError } from "~/components/Error";
import { TextInput } from "~/components/TextInput";
import { LoadedBot, MeLoadedMembership } from "~/routes/me";
import { DISCORD_BOT_TOKEN_RE, cdn } from "~/util/discord";
import { Modal, ModalProps } from "./Modal";

export const BotEditModal = (
  props: ModalProps & {
    memberships: Promise<MeLoadedMembership[]>;
    bot: LoadedBot | undefined;
  },
) => {
  const { t } = useTranslation();
  const { bot, memberships } = props;
  const submit = useSubmit();
  const [error, setError] = useError();
  const [guild, setGuild] = useState<OptionGuild>();

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(() => {
    if (!props.open) {
      setError(undefined);
      setGuild(undefined);
    }
  }, [props.open]);

  return (
    <Modal title={t("updateBot")} {...props}>
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
          submit(form, { method: "PATCH", action: "/me" });
          props.setOpen(false);
        }}
      >
        {error}
        <div className="mb-4 rounded-lg p-3 bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22] flex">
          {bot ? (
            <>
              <img
                className="rounded-full my-auto w-8 h-8 mr-3"
                src={
                  bot.icon
                    ? cdn.appIcon(String(bot.applicationId), bot.icon, {
                        size: 64,
                      })
                    : cdn.defaultAvatar(5)
                }
                alt={bot.name}
              />
              <div className="truncate my-auto">
                <div className="flex max-w-full">
                  <p className="font-semibold truncate dark:text-primary-230 text-base">
                    {bot.name}
                  </p>
                </div>
                {/*
                Show whether token is linked here
                <p className="text-gray-600 dark:text-gray-500 text-xs">
                  {bot.description || (
                    <span className="italic">No description</span>
                  )}
                </p> */}
              </div>
              <a
                className="block ml-auto my-auto"
                href={`https://discord.com/developers/applications/${bot.applicationId}/information`}
                target="_blank"
                rel="noreferrer"
              >
                <Button discordstyle={ButtonStyle.Link} className="text-sm">
                  Portal
                </Button>
              </a>
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
              <TextInput
                name="token"
                label="Bot Token"
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
                Providing a bot token is optional, and if you are not
                comfortable doing so, you can still set up your bot to the full
                extent that is possible without one. When a token is provided,
                it allows your bot to show up in audit logs, have its own
                permissions, and generally operate independently of the main bot
                account (Discohook Utils). For security reasons, your token is
                never shown to you after you save it here.
              </p>
            </div>
            <div className="mt-2">
              <p className="text-sm">{t("server_one")}</p>
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
                onChange={(g) => setGuild(g ?? undefined)}
              />
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

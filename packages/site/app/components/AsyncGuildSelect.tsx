import { calculateUserDefaultAvatarIndex } from "@discordjs/rest";
import type { TFunction } from "i18next";
import { useEffect, useState } from "react";
import { twJoin } from "tailwind-merge";
import { cdn } from "~/util/discord";
import { Twemoji } from "./icons/Twemoji";
import { SimpleCombobox } from "./StringSelect";

export interface OptionGuild {
  id: string | bigint;
  name: string;
  icon?: string | null;
  botJoinedAt?: Date | null;
  favorite?: boolean | null;
}

const getOption = (guild: OptionGuild) => ({
  label: (
    <div
      // If botJoinedAt was selected but it is null, fade the option, but
      // allow users to still select it
      className={twJoin(
        "flex items-center",
        guild.botJoinedAt === null ? "opacity-80" : undefined,
      )}
    >
      {guild.icon ? (
        <img
          src={cdn.icon(String(guild.id), guild.icon)}
          alt=""
          className="rounded-lg size-6 me-1.5 inline-block"
        />
      ) : (
        <img
          src={cdn.defaultAvatar(
            calculateUserDefaultAvatarIndex(String(guild.id)),
          )}
          alt=""
          className="rounded-lg size-6 me-1.5 inline-block"
        />
        // <div className="rounded-lg size-6 me-1.5 inline-flex relative bg-black/10 p-2 text-xs uppercase overflow-x-hidden">
        //   <p className="m-auto">
        //     {guild.name
        //       .split(" ")
        //       .map((s) => s[0] ?? "")
        //       .join("")}
        //   </p>
        // </div>
      )}
      <span>{guild.name}</span>
      {guild.favorite ? <Twemoji emoji="⭐️" className="ms-1" /> : null}
    </div>
  ),
  stringLabel: guild.name,
  value: String(guild.id),
  guild,
});

export const AsyncGuildSelect = (props: {
  t: TFunction;
  /** The list of guilds to select or a promise which resolves them */
  guilds: Promise<OptionGuild[]> | OptionGuild[];
  name?: string;
  value?: OptionGuild | null;
  clearable?: boolean;
  disabled?: boolean;
  multi?: boolean;
  onChange?: (guild: OptionGuild | null) => void;
  className?: string;
}) => {
  const [resolved, setResolved] = useState<OptionGuild[] | undefined>(
    Array.isArray(props.guilds) ? props.guilds : undefined,
  );
  useEffect(() => {
    if (Array.isArray(props.guilds)) {
      setResolved(props.guilds);
      return;
    }
    props.guilds.then((opts) => setResolved(opts));
  }, [props.guilds]);

  return (
    <SimpleCombobox<string | null>
      t={props.t}
      clearable={props.clearable}
      disabled={props.disabled || resolved === undefined}
      // multi={props.multi}
      name={props.name}
      value={props.value ? String(props.value.id) : null}
      className={props.className}
      options={
        resolved
          ? [...resolved]
              .sort((a, b) => {
                if (a.favorite && !b.favorite) return -1;
                if (b.favorite && !a.favorite) return 1;

                let score = 0;
                if (b.botJoinedAt !== undefined) {
                  if (b.botJoinedAt) {
                    score -= 1;
                  }
                }

                score += b.name.toLowerCase() > a.name.toLowerCase() ? -1 : 1;
                return score;
              })
              .map(getOption)
          : []
      }
      filter={(option, query) => {
        const { guild } = option as ReturnType<typeof getOption>;
        return guild.name.toLowerCase().includes(query.toLowerCase());
      }}
      onChange={(guildId) => {
        if (!props.onChange) return;
        if (!guildId) {
          if (props.clearable) props.onChange(null);
          return;
        }

        const guild = resolved?.find((g) => String(g.id) === guildId);
        if (guild) {
          props.onChange(guild);
        }
      }}
    />
  );
};

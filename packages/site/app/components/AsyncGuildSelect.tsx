import { calculateUserDefaultAvatarIndex } from "@discordjs/rest";
import AsyncSelect from "react-select/async";
import { twJoin } from "tailwind-merge";
import { cdn } from "~/util/discord";
import { selectClassNames } from "./StringSelect";
import { Twemoji } from "./icons/Twemoji";

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
      className={twJoin(guild.botJoinedAt === null ? "opacity-80" : undefined)}
    >
      {guild.icon ? (
        <img
          src={cdn.icon(String(guild.id), guild.icon)}
          alt=""
          className="rounded-lg h-6 w-6 ltr:mr-1.5 rtl:ml-1.5 inline-block"
        />
      ) : (
        <img
          src={cdn.defaultAvatar(
            calculateUserDefaultAvatarIndex(String(guild.id)),
          )}
          alt=""
          className="rounded-lg h-6 w-6 ltr:mr-1.5 rtl:ml-1.5 inline-block"
        />
        // <div className="rounded-lg h-6 w-6 ltr:mr-1.5 rtl:ml-1.5 inline-flex relative bg-black/10 p-2 text-xs uppercase overflow-x-hidden">
        //   <p className="m-auto">
        //     {guild.name
        //       .split(" ")
        //       .map((s) => s[0] ?? "")
        //       .join("")}
        //   </p>
        // </div>
      )}
      <span className="align-middle">{guild.name}</span>
      {guild.favorite ? (
        <Twemoji emoji="⭐️" className="ltr:ml-1 rtl:mr-1 align-middle" />
      ) : null}
    </div>
  ),
  value: String(guild.id),
  guild,
});

export const AsyncGuildSelect = (props: {
  guilds: Promise<OptionGuild[]>;
  name?: string;
  value?: OptionGuild | null;
  isClearable?: boolean;
  isDisabled?: boolean;
  isMulti?: boolean;
  onChange?: (guild: OptionGuild | null) => void;
}) => {
  return (
    <AsyncSelect
      cacheOptions
      defaultOptions
      isClearable={props.isClearable}
      isDisabled={props.isDisabled}
      isMulti={props.isMulti}
      name={props.name}
      value={props.value ? getOption(props.value) : undefined}
      loadOptions={(inputValue) =>
        (async () =>
          (await props.guilds)
            .filter((guild) =>
              guild.name.toLowerCase().includes(inputValue.toLowerCase()),
            )
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
            .map(getOption))()
      }
      classNames={selectClassNames}
      onChange={(raw) => {
        const opt = raw as {
          label: JSX.Element;
          value: string;
          guild: OptionGuild;
        } | null;
        if (props.onChange) {
          props.onChange(opt?.guild ?? null);
        }
      }}
    />
  );
};

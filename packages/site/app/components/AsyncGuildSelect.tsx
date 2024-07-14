import AsyncSelect from "react-select/async";
import { cdn } from "~/util/discord";
import { selectClassNames } from "./StringSelect";

export interface OptionGuild {
  id: string | bigint;
  name: string;
  icon?: string | null;
}

const getOption = (guild: OptionGuild) => ({
  label: (
    <>
      {guild.icon && (
        <img
          src={cdn.icon(String(guild.id), guild.icon)}
          alt=""
          className="rounded-lg h-6 w-6 ltr:mr-1.5 rtl:ml-1.5 inline-block"
        />
      )}
      <span className="align-middle">{guild.name}</span>
    </>
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

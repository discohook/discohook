import ReactSelect from "react-select";
import { ResolvableAPIChannel } from "~/util/cache/CacheManager";
import { selectClassNames } from "./StringSelect";
import { channelIcons } from "./preview/Markdown";

const getOption = (channel: ResolvableAPIChannel) => ({
  label: (
    <>
      {channelIcons[channel.type]({ className: "h-5 align-middle" })}
      <span className="align-middle rtl:mr-1">{channel.name}</span>
    </>
  ),
  value: String(channel.id),
  channel,
});

export const ChannelSelect = (props: {
  channels: ResolvableAPIChannel[];
  name?: string;
  value?: ResolvableAPIChannel | null;
  isClearable?: boolean;
  isDisabled?: boolean;
  isMulti?: boolean;
  onChange?: (channel: ResolvableAPIChannel | null) => void;
}) => {
  return (
    <ReactSelect
      isClearable={props.isClearable}
      isDisabled={props.isDisabled}
      isMulti={props.isMulti}
      name={props.name}
      value={props.value ? getOption(props.value) : undefined}
      options={props.channels.map(getOption)}
      classNames={selectClassNames}
      aria-live="off"
      onChange={(raw) => {
        const opt = raw as ReturnType<typeof getOption> | null;
        if (props.onChange) {
          props.onChange(opt?.channel ?? null);
        }
      }}
    />
  );
};

import { Select } from "@base-ui-components/react/select";
import type { TFunction } from "i18next";
import { twJoin } from "tailwind-merge";
import type { ResolvableAPIChannel } from "~/util/cache/CacheManager";
import { CoolIcon } from "./icons/CoolIcon";
import { channelIcons } from "./preview/Markdown";
import { SelectValueTrigger, selectStyles } from "./StringSelect";

export const ChannelSelect = (props: {
  t: TFunction;
  channels: ResolvableAPIChannel[];
  name?: string;
  value?: ResolvableAPIChannel | null;
  clearable?: boolean;
  clearableLabelKey?: string;
  // isMulti?: boolean;
  required?: boolean;
  disabled?: boolean;
  onChange?: (channel: ResolvableAPIChannel | null) => void;
}) => {
  return (
    <Select.Root
      items={[
        ...(props.clearable
          ? [
              {
                value: null,
                label: props.t(props.clearableLabelKey ?? "allChannels"),
              },
            ]
          : []),
        ...props.channels.map((channel) => ({
          value: channel.id,
          label: `#${channel.name}`,
        })),
      ]}
      name={props.name}
      value={props.value === null ? null : props.value?.id}
      onValueChange={(value) => {
        if (!props.onChange) return;
        if (value === null && props.clearable) {
          props.onChange(null);
        } else {
          const channel = props.channels.find((c) => c.id === value);
          if (channel) {
            props.onChange(channel);
          }
        }
      }}
      required={props.required}
      disabled={props.disabled}
    >
      <SelectValueTrigger />
      <Select.Portal>
        <Select.Positioner
          className={selectStyles.positioner}
          align="start"
          alignOffset={2}
        >
          <Select.ScrollUpArrow />
          <Select.Popup>
            <Select.Arrow />
            {props.clearable ? (
              <Select.Item value={null} className={selectStyles.item}>
                <Select.ItemText
                  className={twJoin(selectStyles.itemText, "flex items-center")}
                >
                  {props.t(props.clearableLabelKey ?? "allChannels")}
                </Select.ItemText>
                <Select.ItemIndicator className={selectStyles.itemIndicator}>
                  <CoolIcon icon="Check" />
                </Select.ItemIndicator>
              </Select.Item>
            ) : null}
            {props.channels?.map((channel) => (
              <Select.Item
                key={`channel-select-option-${channel.id}}`}
                value={channel.id}
                className={selectStyles.item}
              >
                <Select.ItemText
                  className={twJoin(selectStyles.itemText, "flex items-center")}
                >
                  {channelIcons[channel.type]({ className: "h-5 me-1.5" })}
                  {channel.name}
                </Select.ItemText>
                <Select.ItemIndicator className={selectStyles.itemIndicator}>
                  <CoolIcon icon="Check" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Popup>
          <Select.ScrollDownArrow />
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
};

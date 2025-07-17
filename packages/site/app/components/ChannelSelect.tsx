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
  // isClearable?: boolean;
  // isMulti?: boolean;
  required?: boolean;
  disabled?: boolean;
  onChange?: (channel: ResolvableAPIChannel | null) => void;
}) => {
  return (
    <Select.Root
      name={props.name}
      value={props.value?.id}
      onValueChange={(value) => {
        const channel = props.channels.find((c) => c.id === value);
        if (props.onChange && channel) {
          props.onChange(channel);
        }
      }}
      required={props.required}
      disabled={props.disabled}
    >
      <SelectValueTrigger t={props.t} />
      <Select.Portal>
        <Select.Positioner
          className={selectStyles.positioner}
          align="start"
          alignOffset={2}
        >
          <Select.ScrollUpArrow />
          <Select.Popup>
            <Select.Arrow />
            {props.channels?.map((channel) => (
              <Select.Item
                key={`channel-select-option-${channel.id}}`}
                value={channel.id}
                className={selectStyles.item}
              >
                <Select.ItemText
                  className={twJoin(selectStyles.itemText, "flex items-center")}
                >
                  {channelIcons[channel.type]({
                    className: "h-5 ltr:mr-1.5 rtl:ml-1.5",
                  })}
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

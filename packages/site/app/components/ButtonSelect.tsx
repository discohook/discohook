import { Select } from "@base-ui-components/react/select";
import type { ButtonStyle } from "discord-api-types/v10";
import { twJoin } from "tailwind-merge";
import { Button } from "./Button";
import { CoolIcon, type CoolIconsGlyph } from "./icons/CoolIcon";
import { selectStyles } from "./StringSelect";

export function ButtonSelect<T>(
  props: React.PropsWithChildren<{
    name?: string;
    options: {
      label: React.ReactNode;
      icon?: CoolIconsGlyph;
      value: T;
      disabled?: boolean;
    }[];
    value?: T;
    onValueChange?: (value: T) => void;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    /** Applied to the trigger (Button) */
    className?: string;
    discordstyle?: ButtonStyle;
    icon?: CoolIconsGlyph | null;
  }>,
) {
  return (
    <Select.Root
      value={props.value}
      onValueChange={props.onValueChange}
      name={props.name}
      required={props.required}
      disabled={props.disabled}
      readOnly={props.readOnly}
    >
      <Select.Trigger
        className="w-fit h-fit"
        disabled={props.disabled}
        // don't duplicate trigger in tab nav
        tabIndex={-1}
      >
        <Button
          className={props.className}
          disabled={props.disabled}
          discordstyle={props.discordstyle}
        >
          {props.children}
          {props.icon !== null ? (
            <CoolIcon
              icon={props.icon ?? "Chevron_Down"}
              className="my-auto ltr:ml-1.5 rtl:mr-1.5 transition-transform"
            />
          ) : null}
        </Button>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          className={selectStyles.positioner}
          align="start"
          alignOffset={2}
        >
          <Select.ScrollUpArrow />
          <Select.Popup>
            <Select.Arrow />
            {props.options?.map((option) => (
              <Select.Item
                key={`button-string-select-option-${option.value}`}
                value={option.value}
                className={selectStyles.item}
                disabled={option.disabled}
              >
                <Select.ItemText
                  className={twJoin(selectStyles.itemText, "flex items-center")}
                >
                  {option.icon ? (
                    <CoolIcon
                      icon={option.icon}
                      className="text-lg ltr:mr-1.5 rtl:ml-1.5"
                    />
                  ) : null}
                  {option.label}
                </Select.ItemText>
                {props.value !== undefined ? (
                  // Only show indicator if the select has a controlled value;
                  // most (all) of our ButtonSelects don't need an indicator
                  <Select.ItemIndicator className={selectStyles.itemIndicator}>
                    <CoolIcon icon="Check" />
                  </Select.ItemIndicator>
                ) : null}
              </Select.Item>
            ))}
          </Select.Popup>
          <Select.ScrollDownArrow />
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

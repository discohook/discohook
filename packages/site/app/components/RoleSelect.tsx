import { Select } from "@base-ui-components/react/select";
import type { TFunction } from "i18next";
import { twJoin } from "tailwind-merge";
import type { ResolvableAPIRole } from "~/util/cache/CacheManager";
import { SelectValueTrigger, selectStyles } from "./StringSelect";
import { decimalToHex } from "./editor/ColorPicker";
import { CoolIcon } from "./icons/CoolIcon";
import { RoleShield } from "./icons/role";

export const RoleSelect = (props: {
  t: TFunction;
  roles: ResolvableAPIRole[];
  name?: string;
  value?: ResolvableAPIRole | null;
  required?: boolean;
  disabled?: boolean;
  onChange?: (role: ResolvableAPIRole | null) => void;
  unassignable?: "disable" | "omit";
  guildId?: string;
  userHighestPosition?: number;
}) => {
  const getRoleAssignable = (role: ResolvableAPIRole) =>
    props.unassignable
      ? !role.managed &&
        (props.guildId ? role.id !== props.guildId : true) &&
        (props.userHighestPosition !== undefined
          ? role.position < props.userHighestPosition
          : true)
      : true;

  return (
    <Select.Root
      name={props.name}
      value={props.value?.id}
      onValueChange={(value) => {
        const role = props.roles.find((r) => r.id === value);
        if (props.onChange && role) {
          props.onChange(role);
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
            {props.roles?.map((role) => {
              const assignable = getRoleAssignable(role);
              if (!assignable && props.unassignable === "omit") {
                return <></>;
              }
              return (
                <Select.Item
                  key={`role-select-option-${role.id}}`}
                  value={role.id}
                  className={selectStyles.item}
                  disabled={!assignable}
                >
                  <Select.ItemText
                    className={twJoin(
                      selectStyles.itemText,
                      "flex items-center",
                    )}
                  >
                    <RoleShield
                      style={{
                        color: decimalToHex(
                          role.color === 0 ? 0x9ca9b4 : role.color,
                        ),
                      }}
                      className="ltr:mr-1.5 rtl:ml-1.5"
                    />
                    {role.name}
                  </Select.ItemText>
                  <Select.ItemIndicator className={selectStyles.itemIndicator}>
                    <CoolIcon icon="Check" />
                  </Select.ItemIndicator>
                </Select.Item>
              );
            })}
          </Select.Popup>
          <Select.ScrollDownArrow />
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
};

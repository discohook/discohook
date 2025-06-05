import { Select as MuiSelect } from "@base-ui-components/react/select";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import Select, { ClassNamesConfig, GroupBase, Props } from "react-select";
import { twJoin } from "tailwind-merge";
import { CoolIcon } from "./icons/CoolIcon";

export type StringSelectProps = Props & { label?: string };

export const selectClassNames: ClassNamesConfig<
  unknown,
  boolean,
  GroupBase<unknown>
> = {
  control: () =>
    "!rounded-lg !bg-[#ebebeb] dark:!bg-[#1e1f22] !border !border-black/[0.08] dark:!border-transparent hover:!border-[#c4c9ce] dark:hover:!border-[#020202] transition-[border] duration-200 !font-medium",
  multiValue: () =>
    "!bg-white !text-[#060607] dark:!bg-primary-600 dark:!text-white",
  multiValueLabel: () => "dark:!text-[#ddd]",
  multiValueRemove: () => "hover:!bg-[#da373c] hover:!text-white",
  singleValue: () => "dark:!text-[#ddd]",
  input: () => "dark:!text-[#ddd]",
  menu: () => "!rounded-lg dark:!bg-background-secondary-dark",
  option: (p) =>
    twJoin(
      "!rounded-lg dark:!bg-background-secondary-dark dark:hover:!bg-[#43444B] !font-semibold !text-sm",
      p.isDisabled ? "!cursor-not-allowed opacity-60" : undefined,
    ),
  menuPortal: () => "!z-30",
};

export const StringSelect: React.FC<StringSelectProps> = (props) => {
  const { t } = useTranslation();
  return (
    <label className="block">
      {props.label && <p className="text-sm">{props.label}</p>}
      <Select
        menuPlacement="auto"
        menuPosition="absolute"
        {...props}
        placeholder={props.placeholder ?? t("defaultPlaceholder")}
        classNames={{
          ...selectClassNames,
          ...(props.classNames ?? {}),
        }}
      />
    </label>
  );
};

/** For mui/base-ui selects */
export const selectStyles = {
  label: "text-sm font-medium cursor-default",
  trigger: twJoin(
    "flex rounded-lg border border-border-normal dark:border-border-normal-dark focus:outline-none h-9 py-0 px-[14px] font-medium !mt-0",
    "disabled:text-gray-600 disabled:cursor-not-allowed",
    "bg-white dark:bg-[#333338]",
  ),
  value: "my-auto truncate ltr:mr-2 rtl:ml-2",
  icon: "ltr:ml-auto rtl:mr-auto my-auto text-lg",
  positioner: twJoin(
    "rounded-lg bg-[#f1f1f1] dark:bg-[#121314] dark:text-[#ddd] font-medium",
    "p-0.5 border border-black/[0.08] z-[35]",
  ),
  item: twJoin(
    "px-[14px] py-0 h-9 flex rounded-lg cursor-pointer",
    "hover:bg-blurple/40 dark:hover:bg-blurple dark:hover:text-primary-200 text-base text-inherit font-medium",
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60",
  ),
  itemText: "my-auto ltr:mr-2 rtl:ml-2",
  itemIndicator: "ltr:ml-auto rtl:mr-auto my-auto text-lg",
};

export const SelectValueTrigger = ({ t }: { t: TFunction }) => (
  <MuiSelect.Trigger className={selectStyles.trigger}>
    <MuiSelect.Value
      placeholder={t("defaultPlaceholder")}
      className={selectStyles.value}
    />
    <MuiSelect.Icon className={selectStyles.icon}>
      <CoolIcon icon="Chevron_Down" />
    </MuiSelect.Icon>
  </MuiSelect.Trigger>
);

export function SimpleStringSelect<T>(
  props: Pick<StringSelectProps, "label" | "name" | "required"> & {
    t: TFunction;
    value: T;
    onChange: (value: T) => void;
    options: { label: string | React.ReactNode; value: T }[];
    disabled?: boolean;
  },
) {
  return (
    <MuiSelect.Root
      name={props.name}
      value={props.value}
      onValueChange={props.onChange}
      required={props.required}
      disabled={props.disabled}
    >
      {props.label ? (
        <MuiSelect.Trigger className={selectStyles.label}>
          {props.label}
        </MuiSelect.Trigger>
      ) : null}
      <SelectValueTrigger t={props.t} />
      <MuiSelect.Portal>
        <MuiSelect.Positioner
          className={selectStyles.positioner}
          align="start"
          alignOffset={2}
        >
          <MuiSelect.ScrollUpArrow />
          <MuiSelect.Popup>
            <MuiSelect.Arrow />
            {props.options?.map((option) => (
              <MuiSelect.Item
                key={`simple-string-select-option-${option.value}`}
                value={option.value}
                className={selectStyles.item}
              >
                <MuiSelect.ItemText className={selectStyles.itemText}>
                  {option.label}
                </MuiSelect.ItemText>
                <MuiSelect.ItemIndicator className={selectStyles.itemIndicator}>
                  <CoolIcon icon="Check" />
                </MuiSelect.ItemIndicator>
              </MuiSelect.Item>
            ))}
          </MuiSelect.Popup>
          <MuiSelect.ScrollDownArrow />
        </MuiSelect.Positioner>
      </MuiSelect.Portal>
    </MuiSelect.Root>
  );
}

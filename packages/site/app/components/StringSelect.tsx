import { Combobox } from "@base-ui-components/react/combobox";
import { Select as MuiSelect } from "@base-ui-components/react/select";
import type { TFunction } from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Select, {
  type ClassNamesConfig,
  type GroupBase,
  type Props,
} from "react-select";
import { twJoin, twMerge } from "tailwind-merge";
import { CoolIcon } from "./icons/CoolIcon";
import { textInputStyles } from "./TextInput";

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
  value: "my-auto truncate me-2",
  icon: "ms-auto my-auto text-lg",
  positioner: twJoin(
    // avoid scrolling issues on mobile by using a sheet-type design. kind of
    // weird for selects with not very many items, but at least it's consistent.
    // TODO: would like to also dim the rest of the app.
    "max-sm:bottom-0 max-sm:!top-auto max-sm:w-full max-sm:w-full max-sm:max-h-72 max-sm:overflow-y-auto max-sm:!transform-none",
    // colors, fonts, spacing
    "rounded-lg bg-[#f1f1f1] dark:bg-[#121314] dark:text-[#ddd] font-medium",
    "p-0.5 border border-black/[0.08] z-[35]",
  ),
  item: twJoin(
    "px-[14px] py-0 h-9 flex rounded-lg cursor-pointer",
    "hover:bg-blurple/40 dark:hover:bg-blurple dark:hover:text-primary-200 text-base text-inherit font-medium",
    "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-60",
  ),
  itemText: "my-auto me-2",
  itemIndicator: "ms-auto my-auto text-lg",
};

export function withDefaultItem<T = string | null>(
  t: TFunction,
  items:
    | Record<string, React.ReactNode>
    | {
        label: React.ReactNode;
        value: T;
      }[],
  placeholderKey?: string,
) {
  const label = t(placeholderKey ?? "defaultPlaceholder");
  if (Array.isArray(items)) {
    return [{ value: null, label }, ...items];
  }
  return { null: label, ...items };
}

export const SelectValueTrigger = ({ className }: { className?: string }) => (
  <MuiSelect.Trigger className={twMerge(selectStyles.trigger, className)}>
    <MuiSelect.Value className={selectStyles.value} />
    <MuiSelect.Icon className={selectStyles.icon}>
      <CoolIcon icon="Chevron_Down" />
    </MuiSelect.Icon>
  </MuiSelect.Trigger>
);

interface SimpleSelectOption<T> {
  /** The full label which will appear with the rest of the options. */
  label: React.ReactNode;
  value: T;
  stringLabel?: string;
}

export function SimpleStringSelect<T>(
  props: Pick<StringSelectProps, "label" | "name" | "required"> & {
    t: TFunction;
    value: T;
    onChange: (value: T) => void;
    options: SimpleSelectOption<T>[];
    disabled?: boolean;
    clearable?: boolean;
    className?: string;
  },
) {
  return (
    <MuiSelect.Root
      items={
        props.clearable
          ? withDefaultItem<T>(
              props.t,
              props.options.map((o) => ({
                ...o,
                label: o.stringLabel ?? String(o.value),
              })),
            )
          : props.options.map((o) => ({
              ...o,
              label: o.stringLabel ?? o.label,
            }))
      }
      name={props.name}
      value={props.value}
      // @ts-expect-error wants T|null but it depends on `clearable`
      onValueChange={props.onChange}
      required={props.required}
      disabled={props.disabled}
    >
      {props.label ? (
        <MuiSelect.Trigger className={selectStyles.label}>
          {props.label}
        </MuiSelect.Trigger>
      ) : null}
      <SelectValueTrigger className={props.className} />
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

export const comboboxStyles = {
  label: selectStyles.label,
  trigger: twJoin(selectStyles.trigger, "items-center grow"),
  positioner: "z-[35]",
  popup: twJoin(
    "[--input-container-height:3rem] origin-[var(--transform-origin)] max-w-[var(--available-width)] max-h-[24rem] rounded-lg bg-[#f1f1f1] dark:bg-[#121314] shadow-lg shadow-gray-200 outline-1 outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300",
  ),
  item: twJoin(
    "grid min-w-[var(--anchor-width)] cursor-pointer grid-cols-[1fr_0.75rem] items-center gap-2 py-2 pe-8 ps-4 text-base leading-4 outline-none select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-2 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-lg data-[highlighted]:before:bg-blurple/40 dark:data-[highlighted]:before:bg-blurple group/item",
  ),
};

type ComboBoxFilter<T> = (
  itemValue: T,
  query: string,
  itemToStringLabel?: (itemValue: T) => string,
) => boolean;

export function SimpleCombobox<T>(
  props: Pick<StringSelectProps, "label" | "name" | "required"> & {
    t: TFunction;
    value: T;
    onChange: (value: T) => void;
    options: SimpleSelectOption<T>[];
    disabled?: boolean;
    clearable?: boolean;
    className?: string;
    filter?: ComboBoxFilter<T>;
  },
) {
  const item = props.options.find((o) => o.value === props.value) ?? null;

  return (
    <Combobox.Root
      items={props.options}
      value={item}
      disabled={props.disabled}
      filter={props.filter}
      onValueChange={(selected) => {
        if (selected) props.onChange(selected.value);
      }}
    >
      <Combobox.Trigger
        className={twJoin(
          comboboxStyles.trigger,
          "truncate text-start group/value-parent",
        )}
        data-base-ui-trigger=""
      >
        <Combobox.Value />
        {!props.value ? (
          <p className="text-muted dark:text-muted-dark">
            {props.t("defaultPlaceholder")}
          </p>
        ) : null}
        <Combobox.Icon className="flex ms-auto">
          <CoolIcon icon="Chevron_Down" />
        </Combobox.Icon>
      </Combobox.Trigger>
      <Combobox.Portal>
        <Combobox.Positioner
          className={comboboxStyles.positioner}
          align="start"
          sideOffset={4}
        >
          <Combobox.Popup
            className={comboboxStyles.popup}
            aria-label={props.t("defaultPlaceholder")}
          >
            <div className="w-auto h-[var(--input-container-height)] text-center p-2">
              <Combobox.Input
                placeholder={props.t("search")}
                className={twMerge(textInputStyles.input, "w-full")}
              />
            </div>
            <Combobox.Empty className="p-4 text-[0.925rem] leading-4 text-gray-600 empty:m-0 empty:p-0">
              {props.t("comboboxEmpty")}
            </Combobox.Empty>
            <Combobox.List className="overflow-y-auto scroll-py-2 py-2 overscroll-contain max-h-[min(calc(24rem-var(--input-container-height)),calc(var(--available-height)-var(--input-container-height)))] empty:p-0">
              {(option: SimpleSelectOption<T>) => (
                <Combobox.Item
                  key={option.value as string}
                  value={option}
                  className={comboboxStyles.item}
                >
                  <div className="col-start-1">{option.label}</div>
                  <Combobox.ItemIndicator className="col-start-2">
                    <CoolIcon icon="Check" className="text-lg" />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

// Not currently used (2025/10/28). Intended for use cases that actually need
// to load new data when the input changes, e.g. very large filterable lists
export function AsyncCombobox<T>(
  props: Pick<StringSelectProps, "label" | "name" | "required"> & {
    t: TFunction;
    value?: T;
    onChange: (value: T) => void;
    defaultOptions?: SimpleSelectOption<T>[];
    disabled?: boolean;
    clearable?: boolean;
    searchable?: boolean;
    loadOptions: (query: string) => Promise<SimpleSelectOption<T>[]>;
    className?: string;
    // filter?: ComboBoxFilter<T>;
  },
) {
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<SimpleSelectOption<T>[]>([]);

  // useEffect(() => {
  //   setLoading(true);
  //   props.loadOptions("").then((opts) => {
  //     setOptions(opts);
  //     setLoading(false);
  //   });
  // }, [props.loadOptions]);

  // if defaultOptions changes (e.g. new data from outside the menu)
  useEffect(() => {
    if (props.defaultOptions) {
      setOptions(props.defaultOptions);
      setLoading(false);
    }
  }, [props.defaultOptions]);

  const filter: ComboBoxFilter<T> = (_value, query) => {
    props.loadOptions(query).then(setOptions);
    // let loadOptions provide the filter
    // I don't think this works currently, perhaps because of how
    // `options` updates work
    return true;
  };

  return (
    <SimpleCombobox<T | null>
      t={props.t}
      options={options}
      value={props.value ?? null}
      disabled={props.disabled || loading}
      clearable={props.clearable}
      className={props.className}
      // @ts-expect-error wants T|null
      filter={filter}
      onChange={(value) => {
        if (value === null) return;
        props.onChange(value);
      }}
    />
  );
}

import { useTranslation } from "react-i18next";
import Select, { ClassNamesConfig, GroupBase, Props } from "react-select";
import { twJoin } from "tailwind-merge";

export type StringSelectProps = Props & { label?: string };

export const selectClassNames: ClassNamesConfig<
  unknown,
  boolean,
  GroupBase<unknown>
> = {
  control: () =>
    "!rounded !bg-[#ebebeb] dark:!bg-[#1e1f22] !border !border-black/[0.08] dark:!border-transparent hover:!border-[#c4c9ce] dark:hover:!border-[#020202] transition-[border] duration-200 !font-medium",
  multiValue: () =>
    "!bg-white !text-[#060607] dark:!bg-primary-600 dark:!text-white",
  multiValueLabel: () => "dark:!text-[#ddd]",
  multiValueRemove: () => "hover:!bg-[#da373c] hover:!text-white",
  singleValue: () => "dark:!text-[#ddd]",
  input: () => "dark:!text-[#ddd]",
  menu: () => "!rounded dark:!bg-background-secondary-dark",
  option: (p) =>
    twJoin(
      "!rounded dark:!bg-background-secondary-dark dark:hover:!bg-[#36373d] !font-semibold !text-sm",
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

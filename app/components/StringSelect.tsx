import LocalizedStrings from "react-localization";
import Select, {
  ActionMeta,
  ClassNamesConfig,
  GroupBase,
  OptionsOrGroups,
} from "react-select";
import { SelectComponents } from "react-select/dist/declarations/src/components";

interface TextSelectProps {
  label?: string;
  name: string;
  options: OptionsOrGroups<unknown, GroupBase<unknown>>;
  components?: Partial<SelectComponents<unknown, boolean, GroupBase<unknown>>>;
  classNames?: ClassNamesConfig<unknown, boolean, GroupBase<unknown>>;
  isClearable?: boolean;
  isSearchable?: boolean;
  isMulti?: boolean;
  isDisabled?: boolean;
  defaultInputValue?: string;
  defaultMenuIsOpen?: boolean;
  defaultValue?: unknown;
  required?: boolean;
  placeholder?: string;
  onChange?: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void;
}

export const selectClassNames: ClassNamesConfig<
  unknown,
  boolean,
  GroupBase<unknown>
> = {
  control: () =>
    "!rounded !bg-[#ebebeb] dark:!bg-[#1e1f22] !border !border-black/[0.08] dark:!border-transparent hover:!border-[#c4c9ce] dark:hover:!border-[#020202] transition-[border] duration-200 !font-medium",
  multiValueLabel: () => "dark:!text-[#ddd]",
  singleValue: () => "dark:!text-[#ddd]",
  input: () => "dark:!text-[#ddd]",
  menu: () => "!rounded dark:!bg-[#2b2d31]",
  option: () =>
    "!rounded dark:!bg-[#2b2d31] dark:hover:!bg-[#36373d] !font-semibold !text-sm",
};

export const selectStrings = new LocalizedStrings({
  en: {
    defaultPlaceholder: "Make a selection",
  },
  de: {
    defaultPlaceholder: "Triff eine Auswahl",
  },
  fr: {
    defaultPlaceholder: "Fais un choix",
  },
  it: {
    defaultPlaceholder: "Seleziona",
  },
  es: {
    defaultPlaceholder: "Haz una selección",
  },
  se: {
    defaultPlaceholder: "Gör ett val",
  },
  ne: {
    defaultPlaceholder: "Maak een selectie",
  },
});

export const StringSelect: React.FC<TextSelectProps> = (props) => {
  return (
    <label className="block">
      {props.label && <p className="text-sm">{props.label}</p>}
      <Select
        {...props}
        placeholder={props.placeholder ?? selectStrings.defaultPlaceholder}
        classNames={{
          ...selectClassNames,
          ...(props.classNames ?? {}),
        }}
      />
    </label>
  );
};

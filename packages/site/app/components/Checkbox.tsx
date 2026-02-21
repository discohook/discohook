import { Checkbox as MuiCheckbox } from "@base-ui-components/react/checkbox";
import { twJoin } from "tailwind-merge";
import { CoolIcon } from "./icons/CoolIcon";

export const Checkbox = (
  props: Pick<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >,
    "name" | "checked" | "disabled" | "readOnly"
  > & {
    label: React.ReactNode;
    description?: React.ReactNode;
    onCheckedChange?: MuiCheckbox.Root.Props["onCheckedChange"];
  },
) => (
  <div>
    <label className="flex items-center gap-2">
      <MuiCheckbox.Root
        className={(s) =>
          twJoin(
            "box-border flex w-6 h-6 items-center justify-center p-0 m-0 shrink-0",
            // anomalous 6px border radius
            "outline-0 border rounded-md",
            s.checked
              ? "border-transparent bg-blurple"
              : "border-[#73747A] dark:border-[#82838A] bg-transparent",
            s.focused
              ? "outline-2 outline-blue-430 outline-offset-2"
              : undefined,
          )
        }
        name={props.name}
        checked={props.checked}
        disabled={props.disabled}
        readOnly={props.readOnly}
        onCheckedChange={props.onCheckedChange}
      >
        <MuiCheckbox.Indicator
          className={(s) =>
            twJoin("flex text-gray-50", !s.checked ? "hidden" : undefined)
          }
        >
          <CoolIcon icon="Check" className="text-lg m-auto" />
        </MuiCheckbox.Indicator>
      </MuiCheckbox.Root>
      <p className="text-sm font-normal">{props.label}</p>
    </label>
    {props.description ? <div>{props.description}</div> : null}
  </div>
);

export const BigCheckbox = (
  props: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > & {
    label: React.ReactNode;
    description?: React.ReactNode;
  },
) => {
  const { label, description } = props;

  return (
    <label className="flex group/checkbox select-none rounded-lg py-2 px-3 bg-gray-200 dark:bg-gray-800 cursor-pointer">
      <input type="checkbox" {...props} className="hidden peer" />
      <BigConditionalBox className={props.className} />
      <BigConditionalBox className={props.className} check />
      <div className="my-auto">
        <p className="text-base font-medium">{label}</p>
        {description && <p className="text-sm">{description}</p>}
      </div>
    </label>
  );
};

const BigConditionalBox: React.FC<{ check?: boolean; className?: string }> = ({
  check,
  className,
}) => (
  <CoolIcon
    icon={check ? "Checkbox_Check" : "Checkbox_Unchecked"}
    className={twJoin(
      "text-2xl my-auto ltr:mr-2 rtl:ml-2",
      check
        ? "hidden peer-checked:inline-flex"
        : "inline-flex peer-checked:hidden",
      className,
    )}
  />
);

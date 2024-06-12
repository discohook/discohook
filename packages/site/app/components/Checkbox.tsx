import { twJoin } from "tailwind-merge";
import { CoolIcon } from "./icons/CoolIcon";

export const Checkbox = (
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
    <div>
      <label className="flex group/checkbox select-none">
        <input type="checkbox" {...props} className="hidden peer" />
        <ConditionalBox className={props.className} check />
        <ConditionalBox className={props.className} />
        <p className="text-sm font-medium flex">{label}</p>
      </label>
      {description && <div>{description}</div>}
    </div>
  );
};

const ConditionalBox: React.FC<{ check?: boolean; className?: string }> = ({
  check,
  className,
}) => (
  <div
    className={twJoin(
      "rounded border h-5 w-5 shrink-0 bg-gray-300 border-gray-200 group-hover/checkbox:bg-gray-400 peer-focus:border-blurple-500 dark:border-gray-600 dark:group-hover/checkbox:bg-gray-600 dark:bg-gray-700 transition-all ltr:mr-1 rtl:ml-1",
      check
        ? "hidden peer-checked:inline-flex"
        : "inline-flex peer-checked:hidden",
      className,
    )}
  >
    {check && <CoolIcon icon="Check" className="m-auto mr-[2px] transition" />}
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
    <label className="flex group/checkbox select-none rounded py-2 px-3 bg-gray-200 dark:bg-gray-700 cursor-pointer">
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

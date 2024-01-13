import { CoolIcon } from "./CoolIcon";

export const Radio = (
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
    <label className="flex group/radio select-none rounded py-2 px-3 bg-gray-200 dark:bg-gray-700 cursor-pointer">
      <input type="radio" {...props} className="hidden peer" />
      <ConditionalBox className={props.className} />
      <ConditionalBox className={props.className} check />
      <div className="my-auto">
        <p className="text-base font-medium">{label}</p>
        {description && <p className="text-sm">{description}</p>}
      </div>
    </label>
  );
};

const ConditionalBox: React.FC<{ check?: boolean; className?: string }> = ({
  check,
  className,
}) => (
  <CoolIcon
    icon={check ? "Radio_Fill" : "Radio_Unchecked"}
    className={`text-2xl my-auto mr-2 ${
      check
        ? "hidden peer-checked:inline-flex"
        : "inline-flex peer-checked:hidden"
    } ${className ?? ""}`}
  />
);

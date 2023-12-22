import { CoolIcon } from "./CoolIcon";

export const Checkbox = (
  props: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > & {
    label: React.ReactNode;
    description?: React.ReactNode;
  }
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
    className={`rounded border h-5 w-5 bg-gray-300 border-gray-200 group-hover/checkbox:bg-gray-400 peer-focus:border-blurple-500 dark:border-gray-600 dark:group-hover/checkbox:bg-gray-600 dark:bg-gray-700 transition-all mr-1 ${
      check
        ? "hidden peer-checked:inline-flex"
        : "inline-flex peer-checked:hidden"
    } ${className ?? ""}`}
  >
    {check && (
      <CoolIcon icon="Check" className="m-auto mr-[2px] transition" />
    )}
  </div>
);

import { twJoin, twMerge } from "tailwind-merge";
import { CoolIcon } from "./icons/CoolIcon";

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
    <label className="flex group/radio select-none rounded py-2 px-3 bg-gray-200 dark:bg-gray-800 cursor-pointer">
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
    className={twJoin(
      "text-2xl my-auto me-2",
      check
        ? "hidden peer-checked:inline-flex"
        : "inline-flex peer-checked:hidden",
      className,
    )}
  />
);

export const RadioishBox = ({
  isSelected,
  onSelect,
  name,
  description,
}: {
  isSelected: boolean;
  onSelect: () => void;
  name: React.ReactNode;
  description: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onSelect}
    data-selected={isSelected ? "" : null}
    className={twMerge(
      "group",
      "rounded-lg bg-white dark:bg-gray-700 shadow-sm hover:shadow-md border p-2 text-center",
      "transition-[box-shadow,border-color,background-color]",
      isSelected
        ? "bg-blurple-100 dark:bg-blurple-600 border-blurple"
        : "border-border-normal dark:border-border-normal-dark",
    )}
  >
    <p className="font-medium">{name}</p>
    <p className="text-muted dark:text-muted-dark dark:group-data-[selected]:text-primary-230 text-sm transition-colors">
      {description}
    </p>
  </button>
);

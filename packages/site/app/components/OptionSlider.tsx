import { twJoin } from "tailwind-merge";

export const OptionSlider = <T extends string | number>({
  value,
  options,
  onSelect,
}: {
  value: T;
  options: { label: string; id: T }[];
  onSelect: (value: T) => void;
}) => {
  const selectedIndex = options.findIndex((o) => o.id === value);
  const individualWidth = 1 / options.length;
  const individualPct = `${individualWidth * 100}%`;
  return (
    <div className="relative h-8 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700">
      <div
        className={twJoin(
          "absolute rounded-lg bg-blurple h-6 transition-all top-[3px]",
        )}
        style={{
          width: `calc(${individualPct} - 0.25rem)`,
          left: `max(${selectedIndex * individualWidth * 100}%, 0.25rem)`,
        }}
      />
      <div className="absolute top-0 left-0 w-full h-full flex z-10">
        {options.map((opt) => (
          <button
            type="button"
            key={`slider-${opt.id}`}
            className={twJoin(
              "my-auto text-sm grow transition-all",
              value === opt.id ? "text-white font-medium" : undefined,
            )}
            style={{ width: individualPct }}
            onClick={() => onSelect(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

import React from "react";

type SetTab = (value: string) => void;

type CustomOnTabClick = (
  e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  setTab: SetTab,
) => void;

export const TabsWindow: React.FC<
  React.PropsWithChildren<{
    data: {
      label: React.ReactNode;
      value: string;
      onClick?: CustomOnTabClick;
    }[];
    tab: string;
    setTab: SetTab;
  }>
> = ({ children, data, tab, setTab }) => {
  return (
    <div className="sm:flex mt-4">
      <div className="flex mb-2 sm:mb-0 overflow-x-auto sm:overflow-hidden sm:block sticky top-4 sm:w-1/5 shrink-0 sm:ltr:mr-4 sm:rtl:ml-4 p-0.5 space-x-0.5 sm:space-x-0 sm:space-y-0.5 bg-slate-100 dark:bg-[#1E1F22] rounded z-10 shadow-md">
        {data.map((t) => (
          <Tab
            key={`tab-${t.value}`}
            {...t}
            currentValue={tab}
            setTab={setTab}
          />
        ))}
      </div>
      <div className="grow space-y-4">{children}</div>
    </div>
  );
};

export const Tab: React.FC<{
  label: React.ReactNode;
  value: string;
  onClick?: CustomOnTabClick;
  setTab: SetTab;
  currentValue: string;
}> = ({ label, value, onClick, setTab, currentValue }) => (
  <button
    type="button"
    className={`${
      currentValue === value
        ? "bg-slate-200 hover:bg-slate-300 dark:bg-gray-800 dark:hover:bg-gray-700 cursor-default"
        : "hover:bg-slate-200 dark:hover:bg-gray-800"
    } rounded transition px-4 py-1.5 font-medium w-fit sm:w-full ltr:text-left rtl:text-right shrink-0 sm:shrink`}
    onClick={(e) => {
      if (onClick) {
        onClick(e, setTab);
      } else {
        setTab(value);
      }
    }}
  >
    {label}
  </button>
);

export const TabHeader: React.FC<
  React.PropsWithChildren & { subtitle?: React.ReactNode }
> = ({ children, subtitle }) => (
  <div className="mb-4">
    <p className="text-xl font-semibold dark:text-gray-100">{children}</p>
    {subtitle}
  </div>
);

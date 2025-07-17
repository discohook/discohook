// Heavily modified from https://react-select.com/advanced#experimental (Popout)

import { type ReactNode, useState } from "react";
import { twMerge } from "tailwind-merge";
import { CoolIcon, type CoolIconsGlyph } from "./icons/CoolIcon";
import {
  StringSelect,
  type StringSelectProps,
  selectClassNames,
} from "./StringSelect";

export const IconSelect: React.FC<
  React.PropsWithChildren<StringSelectProps & { icon: CoolIconsGlyph }>
> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState<{ label: string; value: string } | null>();

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      target={
        <button
          type="button"
          className={props.className}
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={props.isDisabled}
        >
          <CoolIcon icon={props.icon} />
        </button>
      }
    >
      <StringSelect
        {...{ ...props, children: undefined }}
        backspaceRemovesValue={false}
        controlShouldRenderValue={false}
        hideSelectedOptions={false}
        isSearchable={false}
        isClearable={false}
        classNames={{
          ...props.classNames,
          control: (p) =>
            twMerge(
              selectClassNames.control?.(p),
              props.classNames?.control?.(p),
              "!invisible !min-h-0 !max-h-0 !-mt-3",
            ),
          menu: (p) =>
            twMerge(
              selectClassNames.menu?.(p),
              props.classNames?.menu?.(p),
              "!w-max max-w-44 dark:!bg-[#111214]",
            ),
          menuList: (p) =>
            twMerge(
              selectClassNames.menuList?.(p),
              props.classNames?.menuList?.(p),
              "!p-1",
            ),
          option: (p) =>
            twMerge(
              props.classNames?.option?.(p),
              "!rounded !py-1 !px-2.5 !bg-inherit hover:!bg-blurple/40 dark:hover:!bg-blurple !text-base !text-inherit !font-medium",
              p.isDisabled
                ? "!cursor-not-allowed opacity-60"
                : "!cursor-pointer",
            ),
        }}
        menuIsOpen
        onChange={(newValue, a) => {
          setValue(newValue as typeof value);
          setIsOpen(false);
          if (props.onChange) {
            props.onChange(newValue, a);
          }
        }}
        tabSelectsValue={false}
        value={value}
      />
    </Dropdown>
  );
};

const Menu = (props: JSX.IntrinsicElements["div"]) => (
  <div className="absolute mt-1 z-20" {...props} />
);

const Blanket = (props: JSX.IntrinsicElements["div"]) => (
  <div className="bottom-0 left-0 top-0 right-0 fixed z-10" {...props} />
);

const Dropdown = ({
  children,
  isOpen,
  target,
  onClose,
}: {
  children?: ReactNode;
  readonly isOpen: boolean;
  readonly target: ReactNode;
  readonly onClose: () => void;
}) => (
  <div className="relative">
    {target}
    {isOpen ? <Menu>{children}</Menu> : null}
    {isOpen ? <Blanket onClick={onClose} /> : null}
  </div>
);

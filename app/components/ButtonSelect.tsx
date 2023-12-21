// Heavily modified from https://react-select.com/advanced#experimental (Popout)

import { ReactNode, useState } from "react";
import { Button } from "./Button";
import { CoolIcon } from "./CoolIcon";
import {
  StringSelect,
  StringSelectProps,
  selectClassNames,
} from "./StringSelect";

export const ButtonSelect: React.FC<
  React.PropsWithChildren<StringSelectProps>
> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState<{ label: string; value: string } | null>();

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      target={
        <Button
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={props.isDisabled}
        >
          {props.children}
          <CoolIcon
            icon="Chevron_Down"
            className={`my-auto ml-1.5 transition-all ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </Button>
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
          control: (p) =>
            selectClassNames.control!(p) +
            " !invisible !min-h-0 !max-h-0 !-mt-3",
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

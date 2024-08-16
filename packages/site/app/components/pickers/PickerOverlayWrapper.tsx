import { useRef } from "react";
import { createPortal } from "react-dom";
import { twJoin, twMerge } from "tailwind-merge";

export const PickerOverlayWrapper: React.FC<
  React.PropsWithChildren<{
    open: boolean;
    setOpen: (value: boolean) => void;
    containerClassName?: string;
  }>
> = ({ open, setOpen, containerClassName, children }) => {
  const portal = useRef<HTMLDivElement>(null);
  return (
    <div className="relative">
      <div
        ref={portal}
        className={twMerge("absolute z-20", containerClassName)}
      />
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: temp */}
      <div
        className={twJoin(
          "fixed top-0 left-0 z-10",
          open ? "w-screen h-screen" : "hidden",
        )}
        onClick={(e) => {
          if (e.currentTarget === e.target) {
            setOpen(false);
          }
        }}
        // onKeyDown={(e) => {
        //   console.log(e.key);
        // }}
      >
        {open && !!portal.current
          ? createPortal(children, portal.current)
          : undefined}
      </div>
    </div>
  );
};

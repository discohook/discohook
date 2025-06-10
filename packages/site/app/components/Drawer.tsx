// Inspired by @mui/joy/drawer - but no code reused. Instead we re-implement
// with base-ui's `Dialog`. Not as featureful as joy's drawer.

import { Dialog } from "@base-ui-components/react/dialog";
import { twJoin } from "tailwind-merge";
import { DialogBackdrop } from "~/modals/Modal";

export const Drawer: React.FC<
  React.PropsWithChildren<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** defaults to automatic based on document direction */
    anchor?: "left" | "right";
    /** applied to container of children */
    className?: string;
  }>
> = (props) => {
  return (
    <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
      <Dialog.Portal>
        <DialogBackdrop />
        <Dialog.Popup
          // modified from our modal
          className={twJoin(
            // position & size
            "box-border fixed z-[31] translate-x-0 translate-y-0 top-0",
            props.anchor === "left"
              ? "left-0 rounded-r-xl"
              : props.anchor === "right"
                ? "right-0 rounded-l-xl"
                : "start-0 rounded-e-xl",
            "w-96 md:w-1/3 max-w-[min(35rem,_calc(100vw_-_3rem))]",
            "h-screen max-h-screen overflow-y-auto",
            // colors
            "bg-gray-50 text-black dark:bg-gray-800 dark:text-gray-50 shadow",
            // opening/closing animation
            "transition-all",
            "data-[starting-style]:-translate-x-full",
            "data-[ending-style]:-translate-x-full",
          )}
        >
          <div className={props.className}>{props.children}</div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

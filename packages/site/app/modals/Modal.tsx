import { Dialog } from "@base-ui/react/dialog";
import { twJoin, twMerge } from "tailwind-merge";
import { CoolIcon } from "~/components/icons/CoolIcon";

export type ModalProps = React.PropsWithChildren<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>;

export const dialogBackdropClassName = twJoin(
  "fixed z-30 inset-0 bg-black opacity-20 dark:opacity-70 transition-opacity",
  // opening/closing animation
  "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
);

export const DialogBackdrop = () => (
  <Dialog.Backdrop className={dialogBackdropClassName} />
);

export type ModalSize = "sm" | "md" | "lg" | "xl";

const modalSizeClasses: Record<ModalSize, string> = {
  sm: "max-w-[400px] max-h-[min(720px,calc(100vh_-_3rem))]",
  md: "max-w-[480px] max-h-[min(800px,calc(100vh_-_3rem))]",
  lg: "max-w-[680px] max-h-[calc(100vh_-_3rem)]",
  xl: "max-w-[min(60rem,calc(100vw_-_3rem))] max-h-[calc(100vh_-_3rem)]",
};

const modalHeaderClassName = "flex items-start gap-3";
const modalTitleClassName = "min-w-0 text-xl font-semibold leading-[1.2]";
export const modalCloseButtonClassName =
  "flex size-8 shrink-0 items-center justify-center rounded-lg -mt-4 -me-4 text-gray-500 hover:bg-black/5 hover:text-black dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white transition";

export const DialogPortal: React.FC<
  React.PropsWithChildren<{
    title?: React.ReactNode;
    className?: string;
    parentClassName?: string;
    size?: ModalSize;
  }>
> = ({ title, children, className, parentClassName, size = "md" }) => (
  <Dialog.Portal>
    <DialogBackdrop />
    <Dialog.Popup
      className={twMerge(
        // position & size
        "box-border fixed z-[calc(31_-_var(--nested-dialogs))] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        // 24px gutter on every side, then the size cap
        "w-[calc(100vw_-_3rem)] h-fit flex flex-col overflow-hidden rounded-xl",
        modalSizeClasses[size],
        // colors
        "bg-gray-50 text-black dark:bg-[#37373D] dark:text-gray-50",
        "outline outline-1 outline-border-normal dark:outline-border-normal-dark",
        // modal nesting - https://base-ui.com/react/components/dialog
        "scale-[calc(1_-_0.1_*_var(--nested-dialogs))]",
        "brightness-[calc(1_-_0.1_*_var(--nested-dialogs))]",
        "[translate:0_calc(0px_+_1.25rem_*_var(--nested-dialogs))]",
        "data-[nested-dialog-open]:after:content-[''] data-[nested-dialog-open]:after:inset-0 data-[nested-dialog-open]:after:rounded-[inherit]",
        "data-[nested-dialog-open]:after:absolute data-[nested-dialog-open]:after:bg-black/5",
        // opening/closing animation
        "transition-all",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        "data-[starting-style]:-translate-x-1/2 data-[starting-style]:-translate-y-1/2 data-[starting-style]:scale-90",
        "data-[ending-style]:-translate-x-1/2 data-[ending-style]:-translate-y-1/2 data-[ending-style]:scale-90",
        parentClassName,
      )}
    >
      {title ? (
        <div
          className={twJoin(modalHeaderClassName, "shrink-0 px-6 pt-6 pb-4")}
        >
          <Dialog.Title className={twJoin(modalTitleClassName, "grow")}>
            {title}
          </Dialog.Title>
          <Dialog.Close
            aria-label="Close"
            className={modalCloseButtonClassName}
          >
            <CoolIcon icon="Close_MD" className="text-xl" />
          </Dialog.Close>
        </div>
      ) : null}
      <div
        className={twMerge(
          "grow min-h-0 p-6 overflow-y-auto overflow-x-hidden",
          className,
        )}
      >
        {children}
      </div>
    </Dialog.Popup>
  </Dialog.Portal>
);

export const Modal: React.FC<
  ModalProps & {
    title?: React.ReactNode;
    className?: string;
    parentClassName?: string;
    size?: ModalSize;
  }
> = (props) => (
  <Dialog.Root open={props.open} onOpenChange={props.setOpen}>
    <DialogPortal
      title={props.title}
      className={props.className}
      parentClassName={props.parentClassName}
      size={props.size}
    >
      {props.children}
    </DialogPortal>
  </Dialog.Root>
);

export const PlainModalHeader: React.FC<
  React.PropsWithChildren & { onClose?: () => void }
> = ({ children, onClose }) => (
  <div
    className={twJoin(
      modalHeaderClassName,
      "w-full px-6 pt-6 pb-4",
      // Pin the header to the top of the modal body when it is the first element
      "first:sticky first:-top-6 first:z-10 first:-mx-6 first:-mt-6",
      "first:w-[calc(100%_+_3rem)]",
      "first:bg-gray-50 dark:first:bg-[#37373D]",
    )}
  >
    <div className={twJoin(modalTitleClassName, "flex grow items-start")}>
      {children}
    </div>
    {onClose ? (
      <button
        type="button"
        aria-label="Close"
        className={modalCloseButtonClassName}
        onClick={onClose}
      >
        <CoolIcon icon="Close_MD" className="text-xl" />
      </button>
    ) : null}
  </div>
);

export const ModalFooter: React.FC<
  React.PropsWithChildren & { className?: string }
> = ({ children, className }) => (
  <div
    className={twMerge(
      "sticky -bottom-6 z-10 -mx-6 -mb-6 mt-4 flex flex-wrap items-center justify-end gap-x-2 gap-y-4 px-6 pt-4 pb-6 bg-gray-50 dark:bg-[#37373D]",
      className,
    )}
  >
    {children}
  </div>
);

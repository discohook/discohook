import ReactModal from "react-modal";
import { twMerge } from "tailwind-merge";
import { CoolIcon } from "~/components/icons/CoolIcon";

export type ModalProps = React.PropsWithChildren<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>;

export const Modal: React.FC<ModalProps & { title?: React.ReactNode }> = ({
  open,
  setOpen,
  title,
  children,
}) => {
  return (
    <ReactModal
      isOpen={open}
      onRequestClose={() => setOpen(false)}
      ariaHideApp={false}
      closeTimeoutMS={100}
      style={{
        overlay: {
          zIndex: 21,
          backgroundColor: "rgb(0 0 0 / 0.5)",
        },
        content: {
          zIndex: 21,
          padding: 0,
          inset: "1rem",
          background: "none",
          border: "none",
          borderRadius: "0.5rem",
          maxWidth: "42rem",
          height: "fit-content",
          maxHeight: "calc(100% - 2rem)",
          margin: "auto",
          overflow: "visible",
          overflowY: "auto",
        },
      }}
    >
      <div className="rounded-lg bg-gray-50 text-black dark:bg-primary-600 dark:text-gray-50">
        {title && (
          <div className="px-5 py-3 bg-gray-200 dark:bg-gray-900 flex rounded-t-lg">
            <p className="text-xl font-bold my-auto">{title}</p>
            <ModalCloseButton setOpen={setOpen} />
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </ReactModal>
  );
};

export const PlainModalHeader: React.FC<React.PropsWithChildren> = ({
  children,
}) => <div className="font-medium text-lg mb-2 w-full">{children}</div>;

export const ModalCloseButton: React.FC<Pick<ModalProps, "setOpen">> = ({
  setOpen,
}) => (
  <button
    type="button"
    className="ltr:ml-auto rtl:mr-auto mb-auto"
    onClick={() => setOpen(false)}
  >
    <CoolIcon
      icon="Close_MD"
      className="text-2xl text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-gray-300 transition"
    />
  </button>
);

export const ModalFooter: React.FC<
  React.PropsWithChildren & { className?: string }
> = ({ children, className }) => (
  <div
    className={twMerge(
      "-m-5 mt-4 py-4 px-8 bg-background-secondary dark:bg-background-secondary-dark",
      className,
    )}
  >
    {children}
  </div>
);

import ReactModal from "react-modal";
import { CoolIcon } from "~/components/CoolIcon";

export type ModalProps = React.PropsWithChildren<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>;

export const Modal: React.FC<ModalProps & { title?: React.ReactNode; }> = ({
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
          zIndex: 11,
          backgroundColor: "rgb(0 0 0 / 0.5)",
        },
        content: {
          zIndex: 11,
          padding: 0,
          background: "none",
          border: "none",
          borderRadius: "0.5rem",
          maxWidth: "38rem",
          height: "fit-content",
          maxHeight: "calc(100% - 4rem)",
          margin: "auto",
          overflow: "visible",
        },
      }}
    >
      <div className="rounded-lg bg-gray-50 text-black dark:bg-gray-800 dark:text-gray-50">
        {title && (
          <div className="px-5 py-3 bg-gray-200 dark:bg-gray-900 flex rounded-t-lg">
            <p className="text-xl font-black my-auto">{title}</p>
            <ModalCloseButton setOpen={setOpen} />
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </ReactModal>
  );
};

export const ModalCloseButton: React.FC<Pick<ModalProps, "setOpen">> = ({
  setOpen,
}) => (
  <button className="ml-auto mb-auto" onClick={() => setOpen(false)}>
    <CoolIcon
      icon="Close_MD"
      className="text-2xl text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-gray-300 transition"
    />
  </button>
);

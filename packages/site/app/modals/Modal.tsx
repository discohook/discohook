import { Dialog } from "@base-ui-components/react/dialog";
import { twJoin, twMerge } from "tailwind-merge";
import { CoolIcon } from "~/components/icons/CoolIcon";

export type ModalProps = React.PropsWithChildren<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>;

// export const OldModal: React.FC<ModalProps & { title?: React.ReactNode }> = ({
//   open,
//   setOpen,
//   title,
//   children,
// }) => {
//   return (
//     <ReactModal
//       isOpen={open}
//       onRequestClose={() => setOpen(false)}
//       ariaHideApp={false}
//       closeTimeoutMS={100}
//       style={{
//         overlay: {
//           zIndex: 21,
//           backgroundColor: "rgb(0 0 0 / 0.5)",
//         },
//         content: {
//           zIndex: 21,
//           padding: 0,
//           inset: "1rem",
//           background: "none",
//           border: "none",
//           borderRadius: "0.5rem",
//           maxWidth: "42rem",
//           height: "fit-content",
//           maxHeight: "calc(100% - 2rem)",
//           margin: "auto",
//           overflow: "visible",
//           overflowY: "auto",
//         },
//       }}
//     >
//       <div className="rounded-xl bg-gray-50 text-black dark:bg-[#37373D] dark:text-gray-50 border border-border-normal dark:border-border-normal-dark">
//         {title && (
//           <div className="px-5 py-3 bg-gray-200 dark:bg-gray-900 flex rounded-t-xl">
//             <p className="text-xl font-bold my-auto">{title}</p>
//             <ModalCloseButton setOpen={setOpen} />
//           </div>
//         )}
//         <div className="p-5">{children}</div>
//       </div>
//     </ReactModal>
//   );
// };

const ModalPopup: React.FC<
  React.PropsWithChildren<{ title?: React.ReactNode }>
> = ({ title, children }) => (
  <Dialog.Portal>
    <Dialog.Backdrop
      className={twJoin(
        "fixed inset-0 bg-black opacity-20 dark:opacity-70 transition-opacity",
        // opening/closing animation
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
      )}
    />
    <Dialog.Popup
      className={twJoin(
        // position & size
        "box-border fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        "w-[32rem] md:w-1/2 max-w-[calc(100vw_-_3rem)] rounded-xl",
        "max-h-[calc(100vh_-_8rem)] overflow-y-auto h-fit",
        // colors
        "bg-gray-50 text-black dark:bg-[#37373D] dark:text-gray-50",
        "outline outline-1 outline-border-normal dark:outline-border-normal-dark",
        // opening/closing animation
        "transition-all",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        "data-[starting-style]:-translate-x-1/2 data-[starting-style]:-translate-y-1/2 data-[starting-style]:scale-90",
        "data-[ending-style]:-translate-x-1/2 data-[ending-style]:-translate-y-1/2 data-[ending-style]:scale-90",
      )}
    >
      {title ? (
        <div className="px-5 py-3 bg-gray-200 dark:bg-gray-900 flex rounded-t-xl">
          <div className="flex w-full">
            <Dialog.Title className="text-xl font-bold my-auto">
              {title}
            </Dialog.Title>
            <div className="flex justify-end ltr:ml-auto rtl:mr-auto">
              <Dialog.Close>
                <CoolIcon
                  icon="Close_MD"
                  className="text-2xl text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-gray-300 transition"
                />
              </Dialog.Close>
            </div>
          </div>
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </Dialog.Popup>
  </Dialog.Portal>
);

export const Modal: React.FC<ModalProps & { title?: React.ReactNode }> = (
  props,
) => (
  <Dialog.Root open={props.open} onOpenChange={props.setOpen}>
    <ModalPopup title={props.title}>{props.children}</ModalPopup>
  </Dialog.Root>
);

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
      "-m-5 mt-4 py-4 px-8 bg-background-secondary dark:bg-background-secondary-dark rounded-b-xl",
      className,
    )}
  >
    {children}
  </div>
);

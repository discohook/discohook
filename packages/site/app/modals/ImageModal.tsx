import { Dialog } from "@base-ui-components/react/dialog";
import { useEffect, useState } from "react";
import { twJoin } from "tailwind-merge";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { DialogBackdrop } from "./Modal";

export interface ImageModalProps {
  images?: { url: string; alt?: string }[];
  startIndex?: number;
}

export type SetImageModalData = React.Dispatch<
  React.SetStateAction<ImageModalProps | undefined>
>;

export const ImageModal = (props: { clear: () => void } & ImageModalProps) => {
  const { images, startIndex } = props;
  const [index, setIndex] = useState(startIndex);
  const image = images && index !== undefined ? images[index] : undefined;

  useEffect(() => {
    if (images && startIndex !== undefined) setIndex(startIndex);
  }, [images, startIndex]);

  return (
    <Dialog.Root
      open={!!images && startIndex !== undefined}
      onOpenChange={props.clear}
    >
      <Dialog.Portal>
        <DialogBackdrop />
        <Dialog.Popup
          className={twJoin(
            // position & size
            "box-border fixed z-[32] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
            "max-w-full rounded-xl flex",
            "h-fit max-h-full overflow-y-auto",
            // opening/closing animation
            "transition-all",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
            "data-[starting-style]:-translate-x-1/2 data-[starting-style]:-translate-y-1/2 data-[starting-style]:scale-90",
            "data-[ending-style]:-translate-x-1/2 data-[ending-style]:-translate-y-1/2 data-[ending-style]:scale-90",
          )}
        >
          <div className="m-auto w-full flex flex-wrap md:flex-nowrap">
            {images && images.length > 1 && index !== undefined ? (
              <div className="w-6 mx-auto md:my-auto md:ml-0 md:mr-8">
                <button
                  type="button"
                  className="my-auto text-gray-100 text-2xl"
                  onClick={() => {
                    let siblingIndex = index - 1;
                    if (siblingIndex < 0) {
                      siblingIndex = images.length - 1;
                    }
                    setIndex(siblingIndex);
                  }}
                >
                  <CoolIcon icon="Arrow_Left_LG" />
                </button>
              </div>
            ) : null}
            {image ? (
              <div className="m-auto max-h-[calc(100vh_-_4rem)] overflow-hidden">
                <img
                  src={image.url}
                  alt={image.alt}
                  className="rounded-lg min-h-12"
                />
              </div>
            ) : null}
            {images && images.length > 1 && index !== undefined ? (
              <div className="w-6 mx-auto md:my-auto md:mr-0 md:ml-8">
                <button
                  type="button"
                  className="my-auto text-gray-100 text-2xl"
                  onClick={() => {
                    let siblingIndex = index + 1;
                    if (siblingIndex > images.length - 1) {
                      siblingIndex = 0;
                    }
                    setIndex(siblingIndex);
                  }}
                >
                  <CoolIcon icon="Arrow_Right_LG" />
                </button>
              </div>
            ) : null}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

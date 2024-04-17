import { useEffect, useState } from "react";
import ReactModal from "react-modal";
import { CoolIcon } from "~/components/icons/CoolIcon";

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
    <ReactModal
      isOpen={!!images && startIndex !== undefined}
      onRequestClose={props.clear}
      ariaHideApp={false}
      closeTimeoutMS={100}
      style={{
        overlay: {
          zIndex: 21,
          backgroundColor: "rgb(0 0 0 / 0.5)",
          cursor: "zoom-out",
        },
        content: {
          zIndex: 21,
          padding: "0",
          background: "none",
          border: "none",
          maxWidth: "100%",
          height: "fit-content",
          maxHeight: "100%",
          margin: "auto",
          overflow: "visible",
          cursor: "default",
        },
      }}
    >
      <div className="w-full flex flex-wrap md:flex-nowrap">
        <div className="w-6 mx-auto md:my-auto md:ml-0 md:mr-8">
          {images && images.length > 1 && index !== undefined && (
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
          )}
        </div>
        {image && (
          <div className="m-auto max-h-[calc(100vh_-_4rem)] overflow-hidden">
            <img src={image.url} alt={image.alt} className="rounded" />
          </div>
        )}
        <div className="w-6 mx-auto md:my-auto md:mr-0 md:ml-8">
          {images && images.length > 1 && index !== undefined && (
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
          )}
        </div>
      </div>
    </ReactModal>
  );
};

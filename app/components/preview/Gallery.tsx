import { APIAttachment } from "discord-api-types/v10";
import { SetImageModalData } from "~/modals/ImageModal";
import { CoolIcon } from "../CoolIcon";

export const Gallery: React.FC<{
  attachments: APIAttachment[];
  setImageModalData?: SetImageModalData;
}> = ({ attachments, setImageModalData }) => {
  const sized = galleriesBySize[attachments.length];
  if (!sized) return <p>Inappropriate size for gallery.</p>;

  return sized({ attachments, setImageModalData });
};

export const GalleryItem: React.FC<{
  attachments: APIAttachment[];
  index: number;
  className: string;
  itemClassName?: string;
  setImageModalData?: SetImageModalData;
}> = ({ attachments, index, className, itemClassName, setImageModalData }) => {
  const { content_type: contentType, url } = attachments[index];

  return contentType?.startsWith("video/") ? (
    <div className={`relative cursor-pointer ${className}`}>
      <video src={url} className={itemClassName} />
      <div className="absolute top-auto bottom-auto left-auto right-auto p-1 rounded-full bg-black/10 object-cover">
        <CoolIcon icon="Play" />
      </div>
    </div>
  ) : contentType === "image/gif" ? (
    <button
      className={`relative group/gallery-item ${className}`}
      onClick={() => {
        if (setImageModalData) {
          setImageModalData({
            images: attachments.map((a) => ({
              url: a.url,
              alt: a.description,
            })),
            startIndex: index,
          });
        }
      }}
    >
      <img
        src={url}
        className={`w-full h-full object-cover ${itemClassName ?? ""}`}
      />
      <p className="absolute top-1 left-1 rounded px-1 py-0.5 text-sm text-white bg-black/60 font-semibold group-hover/gallery-item:hidden">
        GIF
      </p>
    </button>
  ) : (
    <button
      className={`block ${className}`}
      onClick={() => {
        if (setImageModalData) {
          setImageModalData({
            images: attachments.map((a) => ({
              url: a.url,
              alt: a.description,
            })),
            startIndex: index,
          });
        }
      }}
    >
      <img src={url} className={`block object-cover ${itemClassName ?? ""}`} />
    </button>
  );
};

export const galleriesBySize: Record<number, typeof Gallery> = {
  1: (d) => (
    <div className="w-full">
      <GalleryItem
        className="rounded-lg max-w-full max-h-[350px]"
        itemClassName="rounded-lg"
        {...d}
        index={0}
      />
    </div>
  ),
  2: (d) => (
    <div className="w-full grid grid-cols-2 gap-1 max-w-full max-h-[350px]">
      <GalleryItem
        className="rounded-l-lg rounded-r w-full object-center"
        itemClassName="rounded-l-lg rounded-r"
        {...d}
        index={0}
      />
      <GalleryItem
        className="rounded-r-lg rounded-l w-full object-center"
        itemClassName="rounded-r-lg rounded-l"
        {...d}
        index={1}
      />
    </div>
  ),
  3: (d) => (
    <div className="w-full flex gap-1 max-w-full max-h-[350px]">
      <GalleryItem
        className="rounded-l-lg rounded-r h-[350px] w-2/3"
        itemClassName="rounded-l-lg rounded-r"
        {...d}
        index={0}
      />
      <div className="grid grid-rows-2 gap-1 h-[350px] w-1/3">
        <GalleryItem
          className="rounded rounded-tr-lg object-center"
          itemClassName="rounded rounded-tr-lg w-full h-full"
          {...d}
          index={1}
        />
        <GalleryItem
          className="rounded rounded-br-lg object-center"
          itemClassName="rounded rounded-br-lg w-full h-full"
          {...d}
          index={2}
        />
      </div>
    </div>
  ),
  4: (d) => (
    <div className="w-full grid grid-cols-2 grid-rows-2 gap-1 max-w-full max-h-[350px]">
      <GalleryItem
        className="rounded rounded-tl-lg"
        itemClassName="rounded rounded-tl-lg w-full h-full"
        {...d}
        index={0}
      />
      <GalleryItem
        className="rounded rounded-tr-lg"
        itemClassName="rounded rounded-tr-lg w-full h-full"
        {...d}
        index={1}
      />
      <GalleryItem
        className="rounded rounded-bl-lg"
        itemClassName="rounded rounded-bl-lg w-full h-full"
        {...d}
        index={2}
      />
      <GalleryItem
        className="rounded rounded-br-lg"
        itemClassName="rounded rounded-br-lg w-full h-full"
        {...d}
        index={3}
      />
    </div>
  ),
  5: (d) => (
    <div className="w-full grid gap-1 max-w-full max-h-full">
      <div className="w-full grid grid-cols-2 gap-1">
        <GalleryItem
          className="rounded rounded-tl-lg w-full object-contain aspect-square"
          itemClassName="rounded rounded-tl-lg"
          {...d}
          index={0}
        />
        <GalleryItem
          className="rounded rounded-tr-lg w-full object-contain aspect-square"
          itemClassName="rounded rounded-tr-lg"
          {...d}
          index={1}
        />
      </div>
      <div className="w-full grid grid-cols-3 gap-1">
        <GalleryItem
          className="rounded rounded-bl-lg w-full object-contain aspect-square"
          itemClassName="rounded rounded-bl-lg"
          {...d}
          index={2}
        />
        <GalleryItem
          className="rounded rounded-br-lg w-full object-contain aspect-square"
          itemClassName="rounded rounded-br-lg"
          {...d}
          index={3}
        />
        <GalleryItem
          className="rounded rounded-br-lg w-full object-contain aspect-square"
          itemClassName="rounded rounded-br-lg"
          {...d}
          index={4}
        />
      </div>
    </div>
  ),
  6: (d) => (
    <div className="w-full grid grid-cols-3 grid-rows-2 gap-1 max-w-full">
      {d.attachments.map((_, i) => {
        const largeRound =
          i === 0
            ? "rounded-tl-lg"
            : i === 2
              ? "rounded-tr-lg"
              : i === 3
                ? "rounded-bl-lg"
                : i === 5
                  ? "rounded-br-lg"
                  : "";
        return (
          <GalleryItem
            key={`gallery-attachment-${i}`}
            className={`rounded ${largeRound} h-full object-center aspect-square`}
            itemClassName={`rounded ${largeRound}`}
            {...d}
            index={i}
          />
        );
      })}
    </div>
  ),
  7: (d) => (
    <div className="w-full grid grid-cols-1 grid-rows-1 gap-1 max-w-full">
      <GalleryItem
        className="rounded rounded-t-lg w-full object-center h-[250px]"
        itemClassName="rounded rounded-t-lg"
        {...d}
        index={0}
      />
      <div className="w-full grid grid-rows-2 grid-cols-3 gap-1">
        {d.attachments.slice(1).map((_, i) => {
          const largeRound =
            i === 3 ? "rounded-bl-lg" : i === 5 ? "rounded-br-lg" : "";
          return (
            <GalleryItem
              key={`gallery-attachment-${i}`}
              className={`rounded ${largeRound} h-full object-center aspect-square`}
              itemClassName={`rounded ${largeRound}`}
              {...d}
              index={i}
            />
          );
        })}
      </div>
    </div>
  ),
  8: (d) => (
    <div className="w-full grid grid-cols-1 grid-rows-1 gap-1 max-w-full">
      <div className="w-full grid grid-rows-1 grid-cols-2 gap-1">
        <GalleryItem
          className="rounded rounded-tl-lg w-full h-full object-center aspect-square"
          itemClassName="rounded rounded-tl-lg"
          {...d}
          index={0}
        />
        <GalleryItem
          className="rounded rounded-tr-lg w-full h-full object-center aspect-square"
          itemClassName="rounded rounded-tr-lg"
          {...d}
          index={1}
        />
      </div>
      <div className="w-full grid grid-rows-2 grid-cols-3 gap-1">
        {d.attachments.slice(2).map((_, i) => {
          const largeRound =
            i === 3 ? "rounded-bl-lg" : i === 5 ? "rounded-br-lg" : "";
          return (
            <GalleryItem
              key={`gallery-attachment-${i}`}
              className={`rounded ${largeRound} h-full object-center aspect-square`}
              itemClassName={`rounded ${largeRound}`}
              {...d}
              index={i}
            />
          );
        })}
      </div>
    </div>
  ),
  9: (d) => (
    <div className="w-full grid grid-cols-3 grid-rows-3 gap-1 max-w-full">
      {d.attachments.map((_, i) => {
        const largeRound =
          i === 0
            ? "rounded-tl-lg"
            : i === 2
              ? "rounded-tr-lg"
              : i === 6
                ? "rounded-bl-lg"
                : i === 8
                  ? "rounded-br-lg"
                  : "";
        return (
          <GalleryItem
            key={`gallery-attachment-${i}`}
            className={`rounded ${largeRound} h-full object-center aspect-square`}
            itemClassName={`rounded ${largeRound}`}
            {...d}
            index={i}
          />
        );
      })}
    </div>
  ),
  10: (d) => (
    <div className="w-full grid grid-cols-1 grid-rows-1 gap-1 max-w-full">
      <GalleryItem
        className="rounded rounded-t-lg w-full object-center h-[250px]"
        itemClassName="rounded rounded-t-lg"
        {...d}
        index={0}
      />
      <div className="w-full grid grid-rows-3 grid-cols-3 gap-1">
        {d.attachments.slice(1).map((_, i) => {
          const largeRound =
            i === 6 ? "rounded-bl-lg" : i === 8 ? "rounded-br-lg" : "";
          return (
            <GalleryItem
              key={`gallery-attachment-${i}`}
              className={`rounded ${largeRound} h-full object-center aspect-square`}
              itemClassName={`rounded ${largeRound}`}
              {...d}
              index={i}
            />
          );
        })}
      </div>
    </div>
  ),
};

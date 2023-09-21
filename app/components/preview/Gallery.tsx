import { CoolIcon } from "../CoolIcon";

interface GalleryAttachment {
  mimeType: string;
  url: string;
  alt?: string;
}

export const Gallery: React.FC<{
  attachments: GalleryAttachment[];
}> = ({ attachments }) => {
  const sized = galleriesBySize[attachments.length];
  if (!sized) return <p>Inappropriate size for gallery.</p>;

  return sized({ attachments });
};

export const GalleryItem: React.FC<
  GalleryAttachment & { className: string; itemClassName?: string }
> = ({ className, itemClassName, mimeType, url }) => {
  return mimeType.startsWith("video/") ? (
    <div className={`relative cursor-pointer ${className}`}>
      <video src={url} className={itemClassName} />
      <div className="absolute top-auto bottom-auto left-auto right-auto p-1 rounded-full bg-black/10 object-cover">
        <CoolIcon icon="Play" />
      </div>
    </div>
  ) : mimeType === "image/gif" ? (
    <div className={`relative group/gallery-item cursor-pointer ${className}`}>
      <img
        src={url}
        className={`w-full h-full object-cover ${itemClassName ?? ""}`}
      />
      <p className="absolute top-1 left-1 rounded px-1 py-0.5 text-sm text-white bg-black/60 font-semibold group-hover/gallery-item:hidden">
        GIF
      </p>
    </div>
  ) : (
    <img
      src={url}
      className={`block cursor-pointer object-cover ${className} ${
        itemClassName ?? ""
      }`}
    />
  );
};

export const galleriesBySize: Record<number, typeof Gallery> = {
  1: ({ attachments }) => (
    <div className="w-full">
      <GalleryItem
        className="rounded-lg max-w-[clamp(0px,_400px,_calc(100%_+_1px))] max-h-[400px]"
        itemClassName="rounded-lg"
        {...attachments[0]}
      />
    </div>
  ),
  2: ({ attachments }) => (
    <div className="w-full grid grid-cols-2 gap-1 max-w-[clamp(0px,_400px,_calc(100%_+_1px))]">
      <GalleryItem
        className="rounded-l-lg rounded-r w-full h-[200px]"
        itemClassName="rounded-l-lg rounded-r"
        {...attachments[0]}
      />
      <GalleryItem
        className="rounded-r-lg rounded-l w-full h-[200px]"
        itemClassName="rounded-r-lg rounded-l"
        {...attachments[1]}
      />
    </div>
  ),
  3: ({ attachments }) => (
    <div className="w-full grid grid-cols-2 gap-1 max-w-[clamp(0px,_400px,_calc(100%_+_1px))]">
      <GalleryItem
        className="rounded-l-lg rounded-r h-[200px] w-full"
        itemClassName="rounded-l-lg rounded-r"
        {...attachments[0]}
      />
      <div className="grid grid-rows-2 gap-1 h-[200px]">
        <GalleryItem
          className="rounded rounded-tr-lg w-full h-full object-center"
          itemClassName="rounded rounded-tr-lg"
          {...attachments[1]}
        />
        <GalleryItem
          className="rounded rounded-br-lg w-full h-full object-center"
          itemClassName="rounded rounded-br-lg"
          {...attachments[2]}
        />
      </div>
    </div>
  ),
  4: ({ attachments }) => (
    <div className="w-full grid grid-cols-2 grid-rows-2 gap-1 max-w-[clamp(0px,_400px,_calc(100%_+_1px))]">
      <GalleryItem
        className="rounded rounded-tl-lg h-full object-center aspect-video"
        itemClassName="rounded rounded-tl-lg"
        {...attachments[0]}
      />
      <GalleryItem
        className="rounded rounded-tr-lg h-full object-center aspect-video"
        itemClassName="rounded rounded-tr-lg"
        {...attachments[1]}
      />
      <GalleryItem
        className="rounded rounded-bl-lg h-full object-center aspect-video"
        itemClassName="rounded rounded-bl-lg"
        {...attachments[2]}
      />
      <GalleryItem
        className="rounded rounded-br-lg h-full object-center aspect-video"
        itemClassName="rounded rounded-br-lg"
        {...attachments[3]}
      />
    </div>
  ),
  5: ({ attachments }) => (
    <div className="w-full grid grid-cols-1 grid-rows-2 gap-1 max-w-[clamp(0px,_400px,_calc(100%_+_1px))]">
      <div className="w-full grid grid-cols-2 gap-1">
        <GalleryItem
          className="rounded rounded-tl-lg w-full h-[200px]"
          itemClassName="rounded rounded-tl-lg"
          {...attachments[0]}
        />
        <GalleryItem
          className="rounded rounded-tr-lg w-full h-[200px]"
          itemClassName="rounded rounded-tr-lg"
          {...attachments[1]}
        />
      </div>
      <div className="w-full grid grid-cols-3 gap-1">
        <GalleryItem
          className="rounded rounded-bl-lg h-full object-center aspect-video"
          itemClassName="rounded rounded-bl-lg"
          {...attachments[2]}
        />
        <GalleryItem
          className="rounded rounded-br-lg h-full object-center aspect-video"
          itemClassName="rounded rounded-br-lg"
          {...attachments[3]}
        />
        <GalleryItem
          className="rounded rounded-br-lg h-full object-center aspect-video"
          itemClassName="rounded rounded-br-lg"
          {...attachments[4]}
        />
      </div>
    </div>
  ),
  6: ({ attachments }) => (
    <div className="w-full grid grid-cols-3 grid-rows-2 gap-1 max-w-[clamp(0px,_400px,_calc(100%_+_1px))]">
      {attachments.map((attachment, i) => {
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
            {...attachment}
          />
        );
      })}
    </div>
  ),
  7: ({ attachments }) => (
    <div className="w-full grid grid-cols-1 grid-rows-1 gap-1 max-w-[clamp(0px,_400px,_calc(100%_+_1px))]">
      <GalleryItem
        className="rounded rounded-t-lg w-full object-center h-[200px]"
        itemClassName="rounded rounded-t-lg"
        {...attachments[0]}
      />
      <div className="w-full grid grid-rows-2 grid-cols-3 gap-1">
        {attachments.slice(1).map((attachment, i) => {
          const largeRound =
            i === 3 ? "rounded-bl-lg" : i === 5 ? "rounded-br-lg" : "";
          return (
            <GalleryItem
              key={`gallery-attachment-${i}`}
              className={`rounded ${largeRound} h-full object-center aspect-square`}
              itemClassName={`rounded ${largeRound}`}
              {...attachment}
            />
          );
        })}
      </div>
    </div>
  ),
  8: ({ attachments }) => (
    <div className="w-full grid grid-cols-1 grid-rows-1 gap-1 max-w-[clamp(0px,_400px,_calc(100%_+_1px))]">
      <div className="w-full grid grid-rows-1 grid-cols-2 gap-1">
        <GalleryItem
          className="rounded rounded-tl-lg w-full h-full object-center aspect-square"
          itemClassName="rounded rounded-tl-lg"
          {...attachments[0]}
        />
        <GalleryItem
          className="rounded rounded-tr-lg w-full h-full object-center aspect-square"
          itemClassName="rounded rounded-tr-lg"
          {...attachments[1]}
        />
      </div>
      <div className="w-full grid grid-rows-2 grid-cols-3 gap-1">
        {attachments.slice(2).map((attachment, i) => {
          const largeRound =
            i === 3 ? "rounded-bl-lg" : i === 5 ? "rounded-br-lg" : "";
          return (
            <GalleryItem
              key={`gallery-attachment-${i}`}
              className={`rounded ${largeRound} h-full object-center aspect-square`}
              itemClassName={`rounded ${largeRound}`}
              {...attachment}
            />
          );
        })}
      </div>
    </div>
  ),
  9: ({ attachments }) => (
    <div className="w-full grid grid-cols-3 grid-rows-3 gap-1 max-w-[clamp(0px,_400px,_calc(100%_+_1px))]">
      {attachments.map((attachment, i) => {
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
            {...attachment}
          />
        );
      })}
    </div>
  ),
  10: ({ attachments }) => (
    <div className="w-full grid grid-cols-1 grid-rows-1 gap-1 max-w-[clamp(0px,_400px,_calc(100%_+_1px))]">
      <GalleryItem
        className="rounded rounded-t-lg w-full object-center h-[200px]"
        itemClassName="rounded rounded-t-lg"
        {...attachments[0]}
      />
      <div className="w-full grid grid-rows-3 grid-cols-3 gap-1">
        {attachments.slice(1).map((attachment, i) => {
          const largeRound =
            i === 6 ? "rounded-bl-lg" : i === 8 ? "rounded-br-lg" : "";
          return (
            <GalleryItem
              key={`gallery-attachment-${i}`}
              className={`rounded ${largeRound} h-full object-center aspect-square`}
              itemClassName={`rounded ${largeRound}`}
              {...attachment}
            />
          );
        })}
      </div>
    </div>
  ),
};

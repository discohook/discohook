import type { APIAttachment } from "discord-api-types/v10";
import { twJoin } from "tailwind-merge";
import type { SetImageModalData } from "~/modals/ImageModal";

export const YOUTUBE_REGEX =
  /^https?:\/\/(?:www\.|m\.)?(?:youtube(?:-nocookie)?\.com|youtu\.be)\/((?:shorts\/|embed\/|v\/|live\/)?([\w\-]{5,}))/i;

export const VIMEO_REGEX =
  /^https?:\/\/(?:www\.)?vimeo\.com\/(?:video\/)?(\d+)/i;

export const getYoutubeVideoParameters = (
  url: string,
): {
  id: string;
  seconds?: number;
} | null => {
  const match = url.match(YOUTUBE_REGEX);
  if (!match) return null;

  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }

  const v = u.searchParams.get("v");
  const t = u.searchParams.get("t");

  if (v) {
    return {
      id: v,
      seconds: t ? Number(t) : undefined,
    };
  } else if (match[2] === "watch") {
    // "https://youtube.com/watch" with no parameters
    return null;
  }
  return {
    id: match[2],
    seconds: t ? Number(t) : undefined,
  };
};

export const getVimeoVideoParameters = (
  url: string,
): {
  id: string;
  autoplay?: boolean;
} | null => {
  const match = url.match(VIMEO_REGEX);
  if (!match || !match[1]) return null;

  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }

  return {
    id: match[1],
    autoplay: u.searchParams.get("autoplay") === "1",
  };
};

export const Gallery: React.FC<{
  attachments: APIAttachment[];
  setImageModalData?: SetImageModalData;
  cdn?: string;
}> = ({ attachments, setImageModalData, cdn }) => {
  const sized = galleriesBySize[attachments.length];
  if (!sized) return <p>Inappropriate size for gallery.</p>;

  return sized({ attachments, setImageModalData, cdn });
};

export const GalleryItem: React.FC<{
  attachments: APIAttachment[];
  index: number;
  className: string;
  itemClassName?: string;
  setImageModalData?: SetImageModalData;
  cdn?: string;
}> = ({
  attachments,
  index,
  className,
  itemClassName,
  setImageModalData,
  cdn,
}) => {
  const { content_type: contentType, url } = attachments[index];
  const youtube = getYoutubeVideoParameters(url);
  const vimeo = getVimeoVideoParameters(url);
  // Preview lighter-weight videos instead of GIF files
  const cdnGifVideoUrl =
    cdn && url.startsWith(`${cdn}/tenor/`) && url.endsWith(".gif")
      ? url.replace(/\.gif$/, ".mp4")
      : null;

  return contentType?.startsWith("video/") ? (
    <div className={className}>
      {youtube ? (
        <a
          href={`https://www.youtube.com/watch?${new URLSearchParams({
            v: youtube.id,
            t: youtube.seconds ? String(youtube.seconds) : "",
          })}`}
          target="_blank"
          rel="noreferrer"
        >
          <img
            // 0.jpg is more reliable but it seems to always be 4:3 which is
            // undesirable for videos of any other aspect ratio
            src={`https://img.youtube.com/vi/${youtube.id}/maxresdefault.jpg`}
            className={twJoin("w-full h-full object-cover", itemClassName)}
            alt="YouTube video thumbnail"
          />
        </a>
        // We were originally embedding the video but there is no real reason
        // to do this in a preview. If enough users are confused by Youtube's
        // default fallback thumbnail then we might add an option to enable this
        // <div className={itemClassName}>
        //   <iframe
        //     src={`https://www.youtube-nocookie.com/embed/${youtube.id}${
        //       youtube.seconds != null ? `?start=${youtube.seconds}` : ""
        //     }`}
        //     className="w-full h-full aspect-video"
        //     title="YouTube video player"
        //     frameBorder="0"
        //     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        //     allowFullScreen
        //   />
        // </div>
      ) : vimeo ? (
        <a
          href={`https://www.vimeo.com/${vimeo.id}?autoplay=${
            vimeo.autoplay ? "1" : "0"
          }`}
          target="_blank"
          rel="noreferrer"
        >
          <img
            // not sure if this is reliable
            src={`https://vumbnail.com/${vimeo.id}_large.jpg`}
            className={twJoin("w-full h-full object-cover", itemClassName)}
            alt="Vimeo video thumbnail"
          />
        </a>
      ) : (
        // biome-ignore lint/a11y/useMediaCaption: User-generated content
        <video src={url} className={itemClassName} controls />
      )}
    </div>
  ) : contentType === "image/gif" ? (
    <button
      type="button"
      className={twJoin("relative group/gallery-item", className)}
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
      {cdnGifVideoUrl ? (
        <video
          src={cdnGifVideoUrl}
          className={twJoin("w-full h-full object-cover", itemClassName)}
          autoPlay
          muted
          loop
        />
      ) : (
        <img
          src={url}
          className={twJoin("w-full h-full object-cover", itemClassName)}
          alt=""
        />
      )}
      <p className="absolute top-1 left-1 rounded px-1 py-0.5 text-sm text-white bg-black/60 font-semibold group-hover/gallery-item:hidden">
        GIF
      </p>
    </button>
  ) : (
    <button
      type="button"
      className={twJoin("block", className)}
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
        className={twJoin("block object-cover", itemClassName)}
        alt=""
      />
    </button>
  );
};

export const galleriesBySize: Record<number, typeof Gallery> = {
  1: (d) => (
    <div className="w-full">
      <GalleryItem
        className="rounded-lg max-w-full max-h-[350px]"
        itemClassName="rounded-lg max-h-inherit"
        {...d}
        index={0}
      />
    </div>
  ),
  2: (d) => (
    <div className="w-full grid grid-cols-2 gap-1 max-w-full max-h-[350px] overflow-hidden rounded-lg">
      <GalleryItem
        className="rounded-l-lg rounded-r h-full object-center"
        itemClassName="rounded-l-lg rounded-r h-full"
        {...d}
        index={0}
      />
      <GalleryItem
        className="rounded-r-lg rounded-l h-full object-center"
        itemClassName="rounded-r-lg rounded-l h-full"
        {...d}
        index={1}
      />
    </div>
  ),
  3: (d) => (
    <div className="w-full flex gap-1 max-w-full max-h-[350px] overflow-hidden rounded-lg">
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
    <div className="w-full grid grid-cols-2 grid-rows-2 gap-1 max-w-full max-h-[350px] overflow-hidden rounded-lg">
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
        className="rounded rounded-t-lg w-full object-center max-h-[250px]"
        itemClassName="rounded rounded-t-lg max-h-inherit w-full"
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
        className="rounded rounded-t-lg w-full object-center max-h-[250px]"
        itemClassName="rounded rounded-t-lg max-h-inherit w-full"
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

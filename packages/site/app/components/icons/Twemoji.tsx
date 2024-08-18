import twemoji, {
  type Twemoji as TTwemoji,
  TwemojiOptions,
} from "@twemoji/api";
import { memo } from "react";
import {
  LazyLoadImage,
  LazyLoadImageProps,
} from "react-lazy-load-image-component";
import { twMerge } from "tailwind-merge";

const t = twemoji as TTwemoji;

const generateTwemojiSrc = (icon: string, options: TwemojiOptions) => {
  return "".concat(
    options.base ?? t.base,
    options.folder === "svg" ? "svg" : options.size?.toString() ?? t.size,
    "/",
    icon,
    options.ext ?? t.ext,
  );
};

const UFE0Fg = /\uFE0F/g;
const U200D = String.fromCharCode(0x200d);

// Thanks https://gist.github.com/chibicode/fe195d792270910226c928b69a468206
const Twemoji_: React.FC<
  (
    | { emoji: string; unified?: undefined }
    | { emoji?: undefined; unified: string }
  ) & {
    className?: string;
    title?: string;
    loading?: "lazy" | "eager";
    lazyPlaceholder?: LazyLoadImageProps["placeholder"];
  }
> = ({ emoji, unified, className, title, loading, lazyPlaceholder }) => {
  const icon = emoji
    ? // twemoji - grabTheRightIcon
      t.convert.toCodePoint(
        emoji.indexOf(U200D) < 0 ? emoji.replace(UFE0Fg, "") : emoji,
      )
    : // biome-ignore lint/style/noNonNullAssertion: Has to be one or the other
      unified!;
  const replaced =
    {
      // I don't know why eye-in-speech-bubble is such a problem child but
      // this is my current solution for it.
      "1f441-fe0f-200d-1f5e8-fe0f": "1f441-200d-1f5e8",
    }[icon] ?? icon;

  const props: React.DetailedHTMLProps<
    React.ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  > = {
    src: generateTwemojiSrc(replaced, {
      folder: "svg",
      ext: ".svg",
    }),
    className: twMerge("inline-block w-auto h-4 align-[-0.125em]", className),
  };

  return (
    <span title={title}>
      {loading === "lazy" ? (
        <LazyLoadImage {...props} placeholder={lazyPlaceholder} />
      ) : (
        <img {...props} alt="" />
      )}
    </span>
  );
};

export const Twemoji = memo(Twemoji_);

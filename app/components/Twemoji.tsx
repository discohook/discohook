import twemoji from "@twemoji/api";
import { memo } from "react";

// Thanks https://gist.github.com/chibicode/fe195d792270910226c928b69a468206
const Twemoji_: React.FC<
  (
    | { emoji: string; unified?: undefined }
    | { emoji?: undefined; unified: string }
  ) & {
    className?: string;
    title?: string;
  }
> = ({ emoji, unified, className, title }) => (
  <span
    title={title}
    dangerouslySetInnerHTML={{
      __html: twemoji.parse(
        unified
          ? unified.split("-").map(twemoji.convert.fromCodePoint).join("")
          : emoji!,
        {
          folder: "svg",
          ext: ".svg",
          className: `inline-block w-auto h-4 align-[-0.125em] ${
            className ?? ""
          }`,
        }
      ),
    }}
  />
);

export const Twemoji = memo(Twemoji_);

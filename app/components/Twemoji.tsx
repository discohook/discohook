import { memo } from "react";
import twemoji from "twemoji";

// Thanks https://gist.github.com/chibicode/fe195d792270910226c928b69a468206
const Twemoji_: React.FC<{
  emoji: string;
  className?: string;
  title?: string;
}> = ({ emoji, className, title }) => (
  <span
    title={title}
    dangerouslySetInnerHTML={{
      __html: twemoji.parse(emoji, {
        folder: "svg",
        ext: ".svg",
        // https://github.com/twitter/twemoji/issues/580
        base: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/",
        className: `inline-block w-auto h-4 align-[-0.125em] ${
          className ?? ""
        }`,
      }),
    }}
  />
);

export const Twemoji = memo(Twemoji_);

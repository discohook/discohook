import MarkdownView from "react-showdown";
import { PartialResource } from "~/types/Resources";
import { CUSTOM_EMOJI_RE, MENTION_RE } from "~/util/constants";
import { cdn } from "~/util/discord";
import { relativeTime } from "~/util/time";

export const markdownFeatures = [
  "basic", // bold, italic, underline, spoiler
  "headers",
  "lists",
  "hyperlinks",
  "inline-code",
  "block-code",
  "quotes",
  "mentions", // users, roles, channels, commands, emojis
] as const;
export type MarkdownFeature = (typeof markdownFeatures)[number];

const UNDERLINE_RE = /^__([^__]+)__/;

const SPOILER_RE = /^\|\|([^||]+)\|\|/;

const TIMESTAMP_RE = /^<t:(\d+)(?::(t|T|d|D|f|F|R))?>/;

export const Markdown: React.FC<{
  text: string;
  features: "all" | MarkdownFeature[];
  resolved?: Record<string, PartialResource>;
}> = ({ text, features }) => {
  const f = (search: MarkdownFeature) =>
    features === "all" ? true : features.includes(search);
  return (
    <MarkdownView
      flavor="vanilla"
      markdown={text}
      options={{
        tables: false,
        emoji: f("mentions"),
        ellipsis: false,
        strikethrough: f("basic"),
        simpleLineBreaks: true,
        openLinksInNewWindow: true,
        disableForced4SpacesIndentedSublists: true,
        noHeaderId: true,
      }}
      components={{
        strong: (props) =>
          f("basic") ? (
            <span className="font-bold">{props.children}</span>
          ) : (
            <span>**{props.children}**</span>
          ),
        em: (props) =>
          f("basic") ? (
            <span className="italic">{props.children}</span>
          ) : (
            <span>*{props.children}*</span>
          ),
        h1: (props) => (
          <p
            className={
              f("headers")
                ? "font-bold text-2xl leading-[33px] my-2"
                : undefined
            }
          >
            {props.children}
          </p>
        ),
        h2: (props) => (
          <p
            className={
              f("headers")
                ? "font-bold text-xl leading-[27.5px] mb-2 mt-4"
                : undefined
            }
          >
            {props.children}
          </p>
        ),
        h3: (props) => (
          <p
            className={
              f("headers")
                ? "font-bold text-base leading-[22px] mb-2 mt-4"
                : undefined
            }
          >
            {props.children}
          </p>
        ),
        h4: (props) => <p>#### {props.children}</p>,
        h5: (props) => <p>##### {props.children}</p>,
        h6: (props) => <p>###### {props.children}</p>,
        a: (props) => (
          <a
            className="text-[#006ce7] dark:text-[#00a8fc] hover:underline underline-offset-1"
            title={`${props.children}\n\n(${props.href})`}
            {...props}
          />
        ),
        ul: (props) => f("lists") ? <ul className="list-disc" {...props}/> : <p>- {props.children}</p>,
        ol: (props) => f("lists") ? <ul className="list-decimal" {...props}/> : <p>- {props.children}</p>,
        li: (props) => <li className="ml-4" {...props} />
      }}
      extensions={[
        {
          type: "lang",
          filter: (text) => {
            return text.replace(
              new RegExp(CUSTOM_EMOJI_RE.source.replace(/^\^/, ""), "g"),
              (found) => {
                const match = found.match(CUSTOM_EMOJI_RE)!;
                return `<img src="${cdn.emoji(
                  match[3]
                )}" class="inline-flex h-5 align-text-bottom" alt="${
                  match[2]
                }" title=":${match[2]}:" />`;
              }
            );
          },
        },
        {
          type: "lang",
          filter: (text) => {
            return text.replace(
              new RegExp(MENTION_RE.source.replace(/^\^/, ""), "g"),
              (found) => {
                const match = found.match(MENTION_RE)!;
                let mention = match[1],
                  text;
                switch (match[1]) {
                  case "@!":
                  case "@":
                    text = "user";
                    break;
                  case "@&":
                    mention = "@";
                    text = "role";
                    break;
                  case "#":
                    text = "channel";
                    break;
                  default:
                    text = "unknown";
                    break;
                }

                return `<span class="rounded px-0.5 font-medium cursor-pointer bg-blurple/[0.15] dark:bg-blurple/30 text-blurple dark:text-gray-100 hover:bg-blurple hover:text-white transition">${mention}${text}</span>`;
              }
            );
          },
        },
        {
          type: "lang",
          filter: (text) => {
            return text.replace(
              new RegExp(TIMESTAMP_RE.source.replace(/^\^/, ""), "g"),
              (found) => {
                const match = found.match(TIMESTAMP_RE)!;

                const timestamp = new Date(Number(match[1]) * 1000);
                let text;
                switch (match[2]) {
                  case "t":
                    text = timestamp.toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    });
                    break;
                  case "T":
                    text = timestamp.toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                      second: "2-digit",
                    });
                    break;
                  case "d":
                    text = timestamp.toLocaleDateString();
                    break;
                  case "D":
                    text = timestamp.toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    });
                    break;
                  case "F":
                    // Includes "at" before time in en-US, not sure how to get rid of that
                    text = timestamp.toLocaleString(undefined, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      weekday: "long",
                    });
                    break;
                  case "R":
                    text = relativeTime(timestamp);
                    break;
                  default:
                    // same as "f" style
                    text = timestamp.toLocaleString(undefined, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    });
                    break;
                }

                return `<span class="bg-black/5 rounded">${text}</span>`;
              }
            );
          },
        },
        {
          type: "lang",
          filter: (text) => {
            return text.replace(/\|\|([^||]+)\|\|/g, (found) => {
              const match = found.match(SPOILER_RE)!;
              return `<span class="bg-black/10 rounded">${match[1]}</span>`;
            });
          },
        },
        // I'm aware of the `underline` option, but it disables underscore italics,
        // which means I would need an extension anyway.
        {
          type: "lang",
          filter: (text) => {
            return text.replace(/__([^__]+)__/g, (found) => {
              const match = found.match(UNDERLINE_RE)!;
              return `<span class="underline">${match[1]}</span>`;
            });
          },
        },
      ]}
    />
  );
};

import MarkdownView from "react-showdown";
import { PartialResource } from "~/types/Resources";
import { cdn } from "~/util/discord";
import { relativeTime } from "~/util/time";
import { CoolIcon } from "../CoolIcon";

export const markdownFeatures = [
  "basic", // bold, italic, underline, spoiler
  "headers",
  "lists",
  "hyperlinks",
  "inline-code",
  "block-code",
  "quotes",
  "mentions", // users, roles, channels, commands
  "emojis",
] as const;
export type MarkdownFeature = (typeof markdownFeatures)[number];

const CARET_RE = /(?:^\^)|(?:([^(\\^)])\^)/g;

const UNDERLINE_RE = /^__([^__]+)__/;

const SPOILER_RE = /^\|\|([^||]+)\|\|/;

const TIMESTAMP_RE = /^(?:<|&lt;)t:(\d+)(?::(t|T|d|D|f|F|R))?>/;

const PLAINTEXT_EMOJIS = new Set(["™", "™️", "©", "©️", "®", "®️"]);

const EMOJI_NAME_RE = /^:([^\s:]+?(?:::skin-tone-\d)?):/;

const CUSTOM_EMOJI_RE = /^(?:<|&lt;)(a)?:(\w+):(\d+)>/;

const MENTION_RE =
  /^(?:<|&lt;)(@!?|@&|#)(\d+)>|^(?:<|&lt;)(\/(?! )[\w -]*[\w-]):(\d+)>|^(@(?:everyone|here))/;

const MESSAGE_LINK_RE =
  /^https:\/\/(?:www\.|ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(\d+|@me)\/(\d+)\/(\d+)/;

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
      // sanitize-html was being a bit overzealous with mentions
      markdown={text.replace(/(<)([^<]+)/g, "&lt;$2")}
      options={{
        tables: false,
        emoji: f("emojis"),
        ellipsis: false,
        strikethrough: f("basic"),
        simpleLineBreaks: true,
        openLinksInNewWindow: true,
        disableForced4SpacesIndentedSublists: true,
        noHeaderId: true,
      }}
      components={{
        Mention: ({
          type,
          id,
          text,
        }: {
          type: string;
          id?: string;
          text: string;
        }) => (
          <span
            className="rounded px-0.5 font-medium cursor-pointer bg-blurple/[0.15] dark:bg-blurple/30 text-blurple dark:text-gray-100 hover:bg-blurple hover:text-white transition"
            data-mention-type={type}
            data-mention-id={id}
          >
            {text}
          </span>
        ),
        MessageLink: ({
          guildId,
          channelId,
          messageId,
        }: {
          guildId: string;
          channelId: string;
          messageId: string;
        }) => (
          <a
            className="rounded px-0.5 font-medium cursor-pointer bg-blurple/[0.15] dark:bg-blurple/30 text-blurple dark:text-gray-100 hover:bg-blurple hover:text-white transition inline-flex"
            href={`https://discord.com/channels/${guildId}/${channelId}/${messageId}`}
            target="_blank"
            // data-mention-type="message"
            // data-mention-id={messageId}
          >
            #channel <CoolIcon icon="Chevron_Right_MD" className="my-auto" />{" "}
            <CoolIcon icon="Chat" className="my-auto" />
          </a>
        ),
        Emoji: ({
          id,
          name,
          animated,
        }: {
          id: string;
          name: string;
          animated?: boolean;
        }) => (
          <img
            src={cdn.emoji(id, animated ? "gif" : "webp")}
            className="inline-flex h-5 align-text-bottom"
            alt={name}
            title={`:${name}:`}
            draggable={false}
          />
        ),
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
        a: (props) =>
          f("hyperlinks") ? (
            <a
              className="text-[#006ce7] dark:text-[#00a8fc] hover:underline underline-offset-1"
              title={`${props.title ?? props.children}\n\n(${props.href})`}
              {...props}
            />
          ) : (
            <span>
              [{props.children}
              {props.title && ` "${props.title}"`}]({props.href})
            </span>
          ),
        ul: (props) =>
          f("lists") ? (
            <ul className="list-disc" {...props} />
          ) : (
            <p>- {props.children}</p>
          ),
        ol: (props) =>
          f("lists") ? (
            <ul className="list-decimal" {...props} />
          ) : (
            <p>- {props.children}</p>
          ),
        li: (props) => <li className="ml-4" {...props} />,
        code: (props) =>
          f("inline-code") ? (
            <code
              className="bg-gray-300 text-[0.85em] leading-[1.125rem] whitespace-pre-wrap p-[0.2em] -my-[0.2em] rounded"
              {...props}
            />
          ) : (
            <span>`{props.children}`</span>
          ),
      }}
      extensions={[
        {
          type: "lang",
          filter: (text) => {
            return !f("emojis")
              ? text
              : text.replace(
                  new RegExp(CUSTOM_EMOJI_RE.source.replace(/^\^/, ""), "g"),
                  (found) => {
                    const match = found.match(CUSTOM_EMOJI_RE)!;
                    return `<Emoji id="${match[3]}" name="${
                      match[2]
                    }" animated="${match[1] === "a"}" />`;
                  }
                );
          },
        },
        {
          type: "lang",
          filter: (text) => {
            return !f("mentions")
              ? text
              : text.replace(
                  new RegExp(MENTION_RE.source.replace(CARET_RE, "$1"), "g"),
                  (found) => {
                    const match = found.match(MENTION_RE)!;
                    let text, type;
                    switch (match[1]) {
                      case "@!":
                      case "@":
                        text = "@user";
                        type = "user";
                        break;
                      case "@&":
                        text = "@role";
                        type = "role";
                        break;
                      case "#":
                        text = "#channel";
                        type = "channel";
                        break;
                      default:
                        if (match[3]) {
                          text = match[3];
                          type = "command";
                        } else if (match[5]) {
                          text = match[5];
                          type = "everyone-here";
                        } else {
                          text = `${match[1]}unknown`;
                          type = "unknown";
                        }
                        break;
                    }

                    return `<Mention type="${type}" id="${
                      match[2] ?? match[4]
                    }" text="${text}" />`;
                  }
                );
          },
        },
        {
          type: "lang",
          filter: (text) => {
            return !f("mentions")
              ? text
              : text.replace(
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
            return !f("basic")
              ? text
              : text.replace(/\|\|([^||]+)\|\|/g, (found) => {
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
            return !f("basic")
              ? text
              : text.replace(/__([^__]+)__/g, (found) => {
                  const match = found.match(UNDERLINE_RE)!;
                  return `<span class="underline">${match[1]}</span>`;
                });
          },
        },
        {
          type: "lang",
          filter: (text) => {
            return !f("basic")
              ? text
              : text.replace(
                  new RegExp(MESSAGE_LINK_RE.source.replace(/^\^/, ""), "g"),
                  (found) => {
                    const match = found.match(MESSAGE_LINK_RE)!;
                    return `<MessageLink guildId="${match[1]}" channelId="${match[2]}" messageId="${match[3]}" />`;
                  }
                );
          },
        },
      ]}
    />
  );
};

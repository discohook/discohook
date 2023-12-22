import MarkdownView from "react-showdown";
import { PartialResource } from "~/types/resources";
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
  "mentions", // users, roles, channels, commands, everyone/here
  "emojis",
] as const;
export type MarkdownFeature = (typeof markdownFeatures)[number];

const CARET_RE = /(?:^\^)|(?:([^(\\^)])\^)/g;

const UNDERLINE_RE = /^__([^__]+)__/;

const SPOILER_RE = /^\|\|([^||]+)\|\|/;

const TIMESTAMP_RE = /^(?:<|&lt;)t:(\d+)(?::(t|T|d|D|f|F|R))?>/;

const PLAINTEXT_EMOJIS = new Set(["™", "™️", "©", "©️", "®", "®️"]);

export const EMOJI_NAME_RE = /^:([^\s:]+?(?:::skin-tone-\d)?):/;

export const CUSTOM_EMOJI_RE = /^(?:<|&lt;)(a)?:(\w+):(\d+)>/;

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

  const replaceIf = (feature: MarkdownFeature, text: string) =>
    f(feature) ? text : (t: string) => t;

  return (
    <MarkdownView
      flavor="vanilla"
      // sanitize-html was being a bit overzealous with mentions
      markdown={text
        .replace(/(<)([^<]+)/g, "&lt;$2")
        .split("\n")
        .join(" <br/>")}
      options={{
        tables: false,
        emoji: f("emojis"),
        ellipsis: false,
        strikethrough: f("basic"),
        simpleLineBreaks: true,
        openLinksInNewWindow: true,
        disableForced4SpacesIndentedSublists: true,
        noHeaderId: true,
        simplifiedAutoLink: true,
        ghCodeBlocks: true,
        smoothLivePreview: true,
      }}
      className="contents whitespace-pre-wrap break-words break-all"
      components={{
        Mention: ({
          token,
          id,
          commandName,
          commandId,
          everyoneHere,
        }: {
          token: string;
          id?: string;
          commandName?: string;
          commandId?: string;
          everyoneHere?: "everyone" | "here";
        }) => {
          let type, content;
          switch (token) {
            case "@!":
            case "@":
              content = "@user";
              type = "user";
              break;
            case "@&":
              content = "@role";
              type = "role";
              break;
            case "#":
              content = "#channel";
              type = "channel";
              break;
            default:
              if (commandName) {
                content = commandName;
                type = "command";
              } else if (everyoneHere) {
                content = everyoneHere;
                type = "everyone-here";
              } else {
                content = `${token}unknown`;
                type = "unknown";
              }
              break;
          }

          return (
            <span
              className="rounded px-0.5 font-medium cursor-pointer bg-blurple/[0.15] dark:bg-blurple/30 text-blurple dark:text-gray-100 hover:bg-blurple hover:text-white transition"
              data-mention-type={type}
              data-mention-id={id ?? commandId}
            >
              {content}
            </span>
          );
        },
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
            target="_blank" rel="noreferrer"
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
          flag,
        }: {
          id: string;
          name: string;
          flag?: "a";
        }) => (
          <img
            src={cdn.emoji(id, flag === "a" ? "gif" : "webp")}
            className="inline-flex h-5 align-text-bottom"
            alt={name}
            title={`:${name}:`}
            draggable={false}
          />
        ),
        Timestamp: ({ source }: { source: string }) => {
          const match = source.match(TIMESTAMP_RE)!;
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

          return (
            <time
              className="bg-black/5 rounded"
              dateTime={timestamp.toISOString()}
              data-timestamp-style={match[2]}
            >
              {text}
            </time>
          );
        },
        Quote: ({ children }: React.PropsWithChildren) => {
          return (
            <div className="flex">
              <div className="w-1 rounded bg-[#c4c9ce] dark:bg-[#4e5058] shrink-0" />
              <blockquote className="grow pr-2 pl-3">{children}</blockquote>
            </div>
          );
        },
        p: (props) => <span {...props} />,
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
          <span
            className={
              f("headers")
                ? "font-bold text-2xl leading-[33px] my-2"
                : undefined
            }
          >
            {props.children}
          </span>
        ),
        h2: (props) => (
          <span
            className={
              f("headers")
                ? "font-bold text-xl leading-[27.5px] mb-2 mt-4"
                : undefined
            }
          >
            {props.children}
          </span>
        ),
        h3: (props) => (
          <span
            className={
              f("headers")
                ? "font-bold text-base leading-[22px] mb-2 mt-4"
                : undefined
            }
          >
            {props.children}
          </span>
        ),
        h4: (props) => <span>#### {props.children}</span>,
        h5: (props) => <span>##### {props.children}</span>,
        h6: (props) => <span>###### {props.children}</span>,
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
            <span>- {props.children}</span>
          ),
        ol: (props) =>
          f("lists") ? (
            <ul className="list-decimal" {...props} />
          ) : (
            <span>- {props.children}</span>
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
          regex: new RegExp(CUSTOM_EMOJI_RE.source.replace(/^\^/, ""), "g"),
          replace: replaceIf("emojis", "<Emoji id=\"$3\" name=\"$2\" flag=\"$1\" />"),
        },
        {
          type: "lang",
          regex: new RegExp(MENTION_RE.source.replace(CARET_RE, "$1"), "g"),
          replace: replaceIf(
            "mentions",
            "<Mention token=\"$1\" id=\"$2\" commandName=\"$3\" commandId=\"$4\" everyoneHere=\"$5\" />"
          ),
        },
        {
          type: "lang",
          regex: new RegExp(TIMESTAMP_RE.source.replace(/^\^/, ""), "g"),
          replace: (t: string) => {
            if (!f("mentions")) return t;

            // For some reason, the second group was not being properly passed to Timestamp,
            // so we just pass the whole match and parse in the component
            return `<Timestamp source="${t}" />`;
          },
        },
        {
          type: "lang",
          regex: /\|\|([^||]+)\|\|/g,
          replace: replaceIf(
            "basic",
            "<span class=\"bg-black/10 rounded\">$1</span>"
          ),
        },
        // I'm aware of the `underline` option, but it disables underscore italics,
        // which means I would need an extension anyway.
        {
          type: "lang",
          regex: /__([^__]+)__/g,
          replace: replaceIf("basic", "<span class=\"underline\">$1</span>"),
        },
        {
          type: "lang",
          regex: new RegExp(MESSAGE_LINK_RE.source.replace(/^\^/, ""), "g"),
          replace: replaceIf(
            "basic",
            "<MessageLink guildId=\"$1\" channelId=\"$2\" messageId=\"$3\" />"
          ),
        },
        {
          type: "lang",
          filter: (text) => {
            return text.replace(/^>( )?(.+)$/gm, (found) => {
              const match = found.match(/^>( )?(.+)$/)!;
              if (!match[1]) {
                return `>${match[2]}`;
              } else {
                return `<Quote>${match[2]}</Quote>`;
              }
            });
          },
        },
      ]}
    />
  );
};

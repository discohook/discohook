// This file is a fork of @maddymeow's work on Discohook (AGPL 3.0) - thank you
// https://github.com/discohook/site

import { TFunction } from "i18next";
import { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin, twMerge } from "tailwind-merge";
import {
  CacheManager,
  Resolutions,
  ResolvableAPIChannelType,
} from "~/util/cache/CacheManager";
import { cdn } from "~/util/discord";
import { highlightCode } from "~/util/highlighting";
import { getRelativeDateFormat } from "~/util/markdown/dates";
import {
  findEmoji,
  getEmojiName,
  translateNamedEmoji,
  trimToNearestNonSymbolEmoji,
} from "~/util/markdown/emoji";
import { getRgbComponents } from "~/util/text";
import { CoolIcon } from "../icons/CoolIcon";
import { Twemoji } from "../icons/Twemoji";
import {
  BrowseChannelIcon,
  ForumChannelIcon,
  GuideChannelIcon,
  PostChannelIcon,
  TextChannelIcon,
  ThreadChannelIcon,
  VoiceChannelIcon,
} from "../icons/channel";

type Renderable = string | JSX.Element;
type ResolutionRequests = Record<string, keyof Resolutions>;

type BaseCapture = { size: number };

type MarkdownNode<
  Capture extends BaseCapture = BaseCapture,
  Data extends ResolutionRequests = ResolutionRequests,
> = {
  rule: Rule<Capture>;
  capture: Capture;
  data?: Data;
};

type Rule<
  Capture extends BaseCapture = BaseCapture,
  Data extends ResolutionRequests = ResolutionRequests,
> = {
  capture(source: string, state: State, parse: Parser): Capture | undefined;
  data?(capture: Capture): Data;
  render(
    capture: Capture,
    render: Renderer,
    data: { [Key in keyof Data]?: Resolutions[Data[keyof Data]] | null },
    t?: TFunction,
  ): Renderable;
};

type State = {
  completed: string;
  inQuote: boolean;
  listDepth: number;
  parseParagraphs: boolean;
};

type Parser = (source: string) => MarkdownNode[];
type Renderer = (nodes: MarkdownNode[]) => Renderable[];

type ParseResult = {
  nodes: MarkdownNode[];
  requests: Set<string>;
};

function createMarkdownParser(rules: Rule[]) {
  function parse(content: string, state: State): ParseResult {
    const nodes: MarkdownNode[] = [];
    const requests = new Set<string>();
    let source = content;

    while (source.length > 0) {
      for (const rule of rules) {
        const completed = state.completed;
        const capture = rule.capture(source, state, (content) => {
          const parsed = parse(content, state);
          for (const request of parsed.requests) {
            requests.add(request);
          }
          return parsed.nodes;
        });

        if (capture) {
          nodes.push({
            rule,
            capture,
            data: rule.data?.(capture),
          });

          state.completed = completed + source.slice(0, capture.size);
          source = source.slice(capture.size);
          break;
        }
      }
    }

    for (const node of nodes) {
      if (node.data) {
        for (const request of Object.values(node.data)) {
          requests.add(request as string);
        }
      }
    }

    return { nodes, requests };
  }

  return function parseMarkdown(content: string) {
    return parse(content, {
      completed: "",
      inQuote: false,
      listDepth: 0,
      parseParagraphs: false,
    });
  };
}

function renderMarkdownNodes(
  nodes: MarkdownNode[],
  data: Resolutions | undefined,
  t?: TFunction,
) {
  const elements: (JSX.Element | string)[] = [];

  for (const node of nodes) {
    const rendered = node.rule.render(
      node.capture,
      (nodes) => renderMarkdownNodes(nodes, data),
      data && node.data
        ? Object.fromEntries(
            Object.entries(node.data).map(([key, request]) => {
              return [key, data[request]];
            }),
          )
        : {},
      t,
    );

    let last = elements[elements.length - 1];
    if (typeof rendered === "string" && typeof last === "string") {
      last += rendered;
      elements[elements.length - 1] = last;
    } else {
      elements.push(rendered);
    }
  }

  return elements;
}

function defineRule<
  Capture extends BaseCapture,
  Data extends ResolutionRequests = ResolutionRequests,
>(rule: Rule<Capture, Data>) {
  return rule;
}

const headingRule = defineRule({
  capture(source, state, parse) {
    if (!/\n$|^$/.test(state.completed)) return;
    const match = /^ *(#{1,3})\s+((?!#+)[^\n]+?)#*\s*(?:\n|$)/.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      content: parse(match[2].trim()),
      level: match[1].length,
    };
  },
  render(capture, render) {
    const common =
      "mx-0 mb-[8px] mt-[16px] font-display font-bold leading-[1.375em] text-primary-860 dark:text-primary-130";

    if (capture.level === 1) {
      return (
        <h4
          className={twJoin(
            common,
            "text-[calc(var(--font-size)*1.5)] first:mt-[8px]",
          )}
        >
          {render(capture.content)}
        </h4>
      );
    }
    if (capture.level === 2) {
      return (
        <h5
          className={twJoin(
            common,
            "text-[calc(var(--font-size)*1.25)] first:mt-[8px]",
          )}
        >
          {render(capture.content)}
        </h5>
      );
    }
    return (
      <h6 className={twJoin(common, "text-[length:--font-size]")}>
        {render(capture.content)}
      </h6>
    );
  },
});

const footingRule = defineRule({
  capture(source, state, parse) {
    if (!/\n$|^$/.test(state.completed)) return;
    const match = /^-# +((?!(-#)+)[^\n]+?) *(?:\n|$)/.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      content: parse(match[1].trim()),
    };
  },
  render(capture, render) {
    return (
      <span className="block text-[calc(var(--font-size)*0.8125)] text-muted dark:text-muted-dark">
        {render(capture.content)}
      </span>
    );
  },
});

export const codeBlockStyle =
  "block overflow-x-auto whitespace-pre-wrap rounded border border-primary-200 bg-primary-130 p-[0.5em] indent-0 font-code text-[calc(var(--font-size)*0.875)] leading-[calc(var(--font-size)*1.125)] text-primary-600 dark:border-primary-700 dark:bg-primary-630 dark:text-primary-230 [[data-embed]_&]:border-none [[data-embed]_&]:bg-primary-200 dark:[[data-embed]_&]:bg-primary-700";

const codeBlockRule = defineRule({
  capture(source) {
    // biome-ignore lint/correctness/noEmptyCharacterClassInRegex: Match anything, incl newline
    const match = /^```(?:([\w+.-]+?)\n)?\n*([^\n][^]*?)\n*```/i.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      content: match[2],
      language: match[1],
    };
  },
  render(capture) {
    const html = highlightCode(capture.content, capture.language);
    return (
      <pre className="mt-[6px] max-w-[90%] bg-clip-border">
        {html ? (
          <code
            className={codeBlockStyle}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: highlightCode generates HTML w/ highlight.js
            dangerouslySetInnerHTML={{ __html: html.value }}
          />
        ) : (
          <code className={codeBlockStyle}>{capture.content}</code>
        )}
      </pre>
    );
  },
});

const blockQuoteRule = defineRule({
  capture(source, state, parse) {
    if (state.inQuote) return;
    if (!/^$|\n *$/.test(state.completed)) return;
    const match =
      /^(?: *>>> +(.*))|^(?: *>(?!>>) +[^\n]*(?:\n *>(?!>>) +[^\n]*)*\n?)/su.exec(
        source,
      );
    if (!match) return;

    state.inQuote = true;
    const content = parse(match[1] ?? match[0].replaceAll(/^ *> ?/gm, ""));
    state.inQuote = false;

    return {
      size: match[0].length,
      content,
    };
  },
  render(capture, render) {
    return (
      <div className="flex">
        <div className="w-1 rounded bg-primary-300 dark:bg-primary-500" />
        <blockquote className="max-w-[90%] pl-3 pr-2 indent-0">
          {render(capture.content)}
        </blockquote>
      </div>
    );
  },
});

const listRule = defineRule({
  capture(source, state, parse) {
    if (state.listDepth > 10) return;
    if (!/^$|\n *$/.test(state.completed)) return;
    const match =
      /^( *)([*-]|\d+\.) .+?(?:\n(?! )(?!\1(?:[*-]|\d+\.) )|$)/su.exec(source);
    if (!match) return;

    const bullet = match[2];
    const ordered = bullet.length > 1;
    const start = Math.min(1000000000, Math.max(1, Number(bullet)));
    let lastWasParagraph = false;
    const completed = state.completed;
    const content =
      match[0]
        .replace(/\n{2,}$/, "\n")
        .match(
          /( *)(?:[*-]|\d+\.) +[^\n]*(?:\n(?!\1(?:[*-]|\d+\.) )[^\n]*)*(?:\n|$)/gm,
        )
        ?.map((item, index, items) => {
          const spaces = /^ *(?:[*-]|\d+\.) +/.exec(item)?.[0].length || 1;
          const content = item
            .replaceAll(new RegExp(`^ {1,${spaces}}`, "gm"), "")
            .replace(/^ *(?:[*-]|\d+\.) +/, "");
          const isParagraph =
            content.includes("\n\n") ||
            (index === items.length - 1 && lastWasParagraph);
          lastWasParagraph = isParagraph;

          const currentDepth = state.listDepth;
          state.listDepth += 1;
          state.parseParagraphs = isParagraph;
          state.completed = completed;
          const parsed = parse(
            content.replace(/ *\n+$/, isParagraph ? "\n\n" : ""),
          );
          state.listDepth = currentDepth;
          state.parseParagraphs = false;

          return parsed;
        }) ?? [];

    return {
      size: match[0].length,
      ordered,
      start,
      content,
      depth: state.listDepth + 1,
    };
  },
  render(capture, render) {
    const items = capture.content.map((item) => (
      <li className="mb-[4px] whitespace-break-spaces">{render(item)}</li>
    ));

    if (capture.ordered) {
      const max = capture.start + capture.content.length - 1;
      return (
        <ol
          className="ml-[calc(0.4em+var(--max-digits)*0.6em)] mt-[4px] list-outside list-decimal"
          style={{
            // @ts-expect-error Tailwind var
            "--max-digits": String(max).length,
          }}
          start={capture.start}
        >
          {items}
        </ol>
      );
    }
    return (
      <ul
        className={twJoin(
          "ml-[16px] mt-[4px] list-outside",
          capture.depth > 1 ? "list-[circle]" : "list-disc",
        )}
      >
        {items}
      </ul>
    );
  },
});

const paragraphRule = defineRule({
  capture(source, state, parse) {
    if (!state.parseParagraphs) return;
    const match = /^((?:[^\n]|\n(?! *\n))+)(?:\n *)+\n/.exec(source);
    if (!match) return;

    state.parseParagraphs = false;
    const content = parse(match[1]);
    state.parseParagraphs = true;

    return {
      size: match[0].length,
      content,
    };
  },
  render(capture, render) {
    return <p>{render(capture.content)}</p>;
  },
});

const escapeRule = defineRule({
  capture(source) {
    const match = /^\\([^\d\sA-Za-z])/.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      content: match[1],
    };
  },
  render(capture) {
    return capture.content;
  },
});

export const mentionStyle =
  "rounded-[3px] bg-blurple/[0.15] px-[2px] font-medium text-blurple [unicode-bidi:plaintext] dark:bg-blurple/30 dark:text-blurple-260 transition-colors transition-[50ms]";
const actionableMentionStyle = twMerge(
  mentionStyle,
  "cursor-pointer hover:bg-blurple hover:text-white dark:hover:bg-blurple dark:hover:text-white",
);
const coloredMentionStyle = twMerge(
  mentionStyle,
  "bg-[rgb(var(--color)/0.1)] text-[rgb(var(--color))] hover:bg-[rgb(var(--color)/0.3)] dark:bg-[rgb(var(--color)/0.1)] dark:text-[rgb(var(--color))] dark:hover:bg-[rgb(var(--color)/0.3)]",
);

const referenceRule = defineRule({
  capture(source) {
    const match =
      /^https:\/\/(?:canary\.|ptb\.)?discord.com\/channels\/(\d+|@me)\/(\d+)(?:\/threads\/(\d+))?(?:\/(\d+))?/.exec(
        source,
      );
    if (!match) return;
    return {
      size: match[0].length,
      guild: match[1],
      parent: match[3] ? match[2] : undefined,
      channel: match[3] ?? match[2],
      message: match[4],
    };
  },
  data(capture) {
    // TODO ignore when `guild` is @me
    return {
      // We could also resolve guild here, but that's only necessary
      // for cross-guild message references
      channel: `channel:${capture.channel}`,
    };
  },
  render(_, __, data, t) {
    return (
      <span className={actionableMentionStyle}>
        {
          // Links to messages in forum posts are slightly different (they include
          // the parent title) but that exact functionality is unfeasible here
          data.channel?.type === "post" ? (
            <>
              {channelIcons.forum()}
              forum
              <CoolIcon
                icon="Chevron_Right"
                className="text-[calc(var(--font-size)*0.6)] mx-0.5"
              />
              {channelIcons.post()}
              {data.channel.name ?? (
                <span className="italic">
                  <Trans t={t} i18nKey="mention.unknown" />
                </span>
              )}
            </>
          ) : data.channel ? (
            <>
              {channelIcons[data.channel.type]()}
              {data.channel.name ?? (
                <span className="italic">
                  <Trans t={t} i18nKey="mention.unknown" />
                </span>
              )}
              {/*
                Why is the chevron so tiny in the Discord client? My reproduction
                is too big, I felt weird making it smaller
              */}
              <CoolIcon
                icon="Chevron_Right"
                className="text-[calc(var(--font-size)*0.6)] mx-0.5"
              />
              {channelIcons.post()}
            </>
          ) : (
            <>
              {channelIcons.text()}
              <span className="italic">
                <Trans t={t} i18nKey="mention.unknown" />
              </span>
            </>
          )
        }
      </span>
    );
  },
});

export const linkClassName = twMerge(
  "text-blue-430 [word-break:break-word] hover:underline dark:text-blue-345",
);

/**
 * Transforms URLs like `discohook://path` to `/path`, which the client
 * will resolve appropriately
 */
const pathize = (href: string) => href.replace(/^discohook:\/\//, "/");

const resolvePathable = (href: string) => {
  const path = pathize(href);
  if (path !== href) {
    let origin: string;
    try {
      origin = window.location.origin;
    } catch {
      origin = "https://discohook.app";
    }
    return new URL(path, origin).href;
  }
  return href;
};

const linkRule = defineRule({
  capture(source) {
    const match = /^<([^ :>]+:\/[^ >]+)>/.exec(source);
    if (!match) return;
    try {
      new URL(match[1]);
    } catch {
      return;
    }
    return {
      size: match[0].length,
      url: new URL(match[1]).href,
    };
  },
  render(capture) {
    return (
      <a
        href={pathize(capture.url)}
        className={linkClassName}
        rel="noreferrer noopener nofollow ugc"
        target="_blank"
      >
        {resolvePathable(capture.url)}
      </a>
    );
  },
});

const autoLinkRule = defineRule({
  capture(source) {
    const match = /^(?:discohook|https?):\/\/[^\s<]+[^\s"',.:;<\]]/.exec(
      source,
    );
    if (!match) return;

    let url = match[0];
    let searchLeft = 0;
    let searchRight = url.length - 1;

    while (url[searchRight] === ")") {
      const index = url.indexOf("(", searchLeft);
      if (index === -1) {
        url = url.slice(0, -1);
        break;
      }
      searchLeft = index + 1;
      searchRight -= 1;
    }

    try {
      new URL(url);
    } catch {
      return;
    }
    return { size: url.length, url };
  },
  render(capture) {
    return (
      <a
        href={pathize(capture.url)}
        className={linkClassName}
        rel="noreferrer noopener nofollow ugc"
        target="_blank"
      >
        {resolvePathable(capture.url)}
      </a>
    );
  },
});

const INVITE_RESOLVABLE_RE =
  /^(https:\/\/)?((?:www\.)?(discord(?:app)?\.com\/invite)|(discord\.gg))\/(?<invite>.+)/;

const maskedLinkRule = defineRule({
  capture(source, _, parse) {
    const match =
      /^\[((?:\[[^\]]*\]|[^[\]]|\](?=[^[]*\]))*)\]\(\s*<?((?:\([^)]*\)|[^\s\\]|\\.)*?)>?(?:\s+['"](.*?)['"])?\s*\)/su.exec(
        source,
      );
    if (!match) return;

    const invalid = {
      valid: false,
      size: match[0].length,
      // We don't want to render any markdown inside of invalid masked links
      raw: match[0],
      content: parse(match[1]),
      url: match[2],
      title: match[3],
    };

    // empty space cannot be mask text
    if (match[1].trim().length === 0) {
      return invalid;
    }

    // URLs cannot be mask text
    try {
      new URL(match[1]);
      return invalid;
    } catch {}

    let url: URL;
    try {
      url = new URL(match[2]);
    } catch {
      return;
    }

    // invite links cannot be mask test
    if (INVITE_RESOLVABLE_RE.test(match[1])) {
      return invalid;
    }

    return {
      valid: true,
      size: match[0].length,
      raw: match[0],
      content: parse(match[1]),
      url: url.href,
      title: match[3],
    };
  },
  render(capture, render) {
    return capture.valid ? (
      <a
        href={pathize(capture.url)}
        title={capture.title}
        className={linkClassName}
        rel="noreferrer noopener nofollow ugc"
        target="_blank"
      >
        {render(capture.content)}
      </a>
    ) : (
      <span>{capture.raw}</span>
    );
  },
});

// For blog-type posts; not actually used in Discord previews
const maskedImageLinkRule = defineRule({
  // Exact same as maskedLinkRule pattern except with a prefixing `!`
  // Considering the complexity of this regex it would be desirable to reduce this
  capture(source) {
    const match =
      /^!\[((?:\[[^\]]*\]|[^[\]]|\](?=[^[]*\]))*)\]\(\s*<?((?:\([^)]*\)|[^\s\\]|\\.)*?)>?(?:\s+['"](.*?)['"])?\s*\)/su.exec(
        source,
      );
    if (!match) return;
    try {
      new URL(match[2]);
    } catch {
      return;
    }

    const dotDelimited = new URL(match[2]).pathname.split(".");
    return {
      size: match[0].length,
      content: match[1],
      url: new URL(match[2]).href,
      extension:
        dotDelimited.length === 0
          ? null
          : dotDelimited[dotDelimited.length - 1].toLowerCase(),
      title: match[3],
    };
  },
  render(capture) {
    return capture.extension !== null && ["mp4"].includes(capture.extension) ? (
      // biome-ignore lint/a11y/useMediaCaption: Not available
      <video
        title={capture.title}
        className="rounded-lg"
        rel="noreferrer noopener nofollow ugc"
        controls
      >
        <source src={pathize(capture.url)} type="video/mp4" />
      </video>
    ) : (
      <img
        src={pathize(capture.url)}
        title={capture.title}
        className="rounded-lg"
        rel="noreferrer noopener nofollow ugc"
        alt={capture.content || capture.title}
      />
    );
  },
});

const emphasisRule = defineRule({
  capture(source, _, parse) {
    const match =
      /^\b_((?:__|\\.|[^\\_])+?)_\b|^\*(?=\S)((?:\*\*|\\.|\s+(?:\\.|[^\s*\\]|\*\*)|[^\s*\\])+?)\*(?!\*)/su.exec(
        source,
      );
    if (!match) return;
    return {
      size: match[0].length,
      content: parse(match[2] || match[1]),
    };
  },
  render(capture, render) {
    return <em>{render(capture.content)}</em>;
  },
});

const strongRule = defineRule({
  capture(source, _, parse) {
    const match = /^\*\*((?:\\.|[^\\])+?)\*\*(?!\*)/su.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      content: parse(match[1]),
    };
  },
  render(capture, render) {
    return <strong className="font-semibold">{render(capture.content)}</strong>;
  },
});

const underlineRule = defineRule({
  capture(source, _, parse) {
    const match = /^__((?:\\.|[^\\])+?)__(?!_)/su.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      content: parse(match[1]),
    };
  },
  render(capture, render) {
    return <u>{render(capture.content)}</u>;
  },
});

const strikethroughRule = defineRule({
  capture(source, _, parse) {
    const match = /^~~(.+?)~~(?!_)/su.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      content: parse(match[1]),
    };
  },
  render(capture, render) {
    return <s>{render(capture.content)}</s>;
  },
});

export const codeStyle =
  "my-[-0.2em] size-auto whitespace-pre-wrap rounded-[3px] bg-primary-130 p-[0.2em] indent-0 font-code text-[length:0.85em] leading-[calc(var(--font-size)*1.125)] dark:bg-primary-630";

const codeRule = defineRule({
  capture(source) {
    const match = /^(`+)(.*?[^`])\1(?!`)/su.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      content: match[2],
    };
  },
  render(capture) {
    return <code className={codeStyle}>{capture.content}</code>;
  },
});

const breakRule = defineRule({
  capture(source) {
    const match = /^ {2,}\n/.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
    };
  },
  render() {
    return <br />;
  },
});

const spoilerRule = defineRule({
  capture(source, _, parse) {
    const match = /^\|\|(.+?)\|\|/su.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      content: parse(match[1]),
    };
  },
  render(capture, render) {
    return (
      <span className="rounded-[4px] bg-black/10 box-decoration-clone dark:bg-white/10">
        {render(capture.content)}
      </span>
    );
  },
});

export const timestampFormats = {
  t: "time",
  T: "time_verbose",
  f: "full",
  F: "full_verbose",
  d: "date",
  D: "date_verbose",
  R: "relative",
} as const;
const timestampRule = defineRule({
  capture(source) {
    const match = /^<t:(-?\d+)(?::([DFRTdft]))?>/.exec(source);
    if (!match) return;
    const date = new Date(Number(match[1]) * 1000);
    if (Number.isNaN(date.getTime())) return;
    return {
      size: match[0].length,
      date,
      format:
        timestampFormats[(match[2] as keyof typeof timestampFormats) ?? "f"],
    };
  },
  render(capture, _, __, t) {
    const [relativeFormat, n] = getRelativeDateFormat(capture.date);
    const format =
      capture.format === "relative"
        ? (`relative.${relativeFormat}` as const)
        : capture.format;

    return (
      <span
        className="rounded-[3px] bg-primary-400/[0.24] px-[2px] dark:bg-primary-500/[0.48]"
        title={capture.date.toLocaleString()}
      >
        <Trans
          t={t}
          i18nKey={`timestamp.${format}`}
          values={{ date: capture.date, count: n }}
        />
      </span>
    );
  },
});

const channelIconStyle =
  "mb-[calc(var(--font-size)*0.2)] inline size-[--font-size] align-text-bottom mr-1";
export const channelIcons: Record<
  ResolvableAPIChannelType | "guide" | "browse",
  (props?: { className?: string }) => JSX.Element
> = {
  guide: (props?: { className?: string }) => (
    <GuideChannelIcon className={twMerge(channelIconStyle, props?.className)} />
  ),
  browse: (props?: { className?: string }) => (
    <BrowseChannelIcon
      className={twMerge(channelIconStyle, props?.className)}
    />
  ),
  text: (props?: { className?: string }) => (
    <TextChannelIcon className={twMerge(channelIconStyle, props?.className)} />
  ),
  voice: (props?: { className?: string }) => (
    <VoiceChannelIcon className={twMerge(channelIconStyle, props?.className)} />
  ),
  thread: (props?: { className?: string }) => (
    <ThreadChannelIcon
      className={twMerge(channelIconStyle, props?.className)}
    />
  ),
  forum: (props?: { className?: string }) => (
    <ForumChannelIcon className={twMerge(channelIconStyle, props?.className)} />
  ),
  post: (props?: { className?: string }) => (
    <PostChannelIcon className={twMerge(channelIconStyle, props?.className)} />
  ),
} as const;

const globalMentionRule = defineRule({
  capture(source) {
    const match = /^@everyone|^@here/.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      content: match[0],
    };
  },
  render(capture) {
    return <span className={mentionStyle}>{capture.content}</span>;
  },
});

const guildSectionMentionRule = defineRule({
  capture(source) {
    const match = /^<id:(guide|browse|customize)>/.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      id: match[1],
    };
  },
  render(capture, _, __, t) {
    const type =
      capture.id === "customize"
        ? "browse"
        : (capture.id as "guide" | "browse");

    return (
      <span className={actionableMentionStyle}>
        {channelIcons[type]()}
        <Trans t={t} i18nKey={`mention.${capture.id}`} />
      </span>
    );
  },
});

const channelMentionRule = defineRule({
  capture(source) {
    const match = /^<#(\d+)>/.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      id: match[1],
    };
  },
  data(capture) {
    return {
      channel: `channel:${capture.id}`,
    };
  },
  render(_capture, _, data, t) {
    if (data.channel === undefined) {
      <span className={actionableMentionStyle}>
        {channelIcons.text()}channel
      </span>;
    }

    return (
      <span className={actionableMentionStyle}>
        {channelIcons[data.channel?.type ?? "text"]()}
        {data.channel?.name ?? (
          <span className="italic">
            <Trans t={t} i18nKey="mention.unknown" />
          </span>
        )}
      </span>
    );
  },
});

const memberMentionRule = defineRule({
  capture(source) {
    const match = /^<@!?(\d+)>/.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      id: match[1],
    };
  },
  data(capture) {
    return {
      member: `member:@global-${capture.id}`,
    };
  },
  render(capture, _, data, t) {
    if (data.member === undefined) {
      <span className={actionableMentionStyle}>@member</span>;
    }

    return (
      <span className={actionableMentionStyle}>
        {data.member ? (
          `@${
            data.member.nick ??
            data.member.user.global_name ??
            data.member.user.username
          }`
        ) : (
          <span>
            @<Trans t={t} i18nKey="mention.unknownUser" />
          </span>
        )}
      </span>
    );
  },
});

const roleMentionRule = defineRule({
  capture(source) {
    const match = /^<@&(\d+)>/.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      id: match[1],
    };
  },
  data(capture) {
    return {
      role: `role:${capture.id}`,
    };
  },
  render(capture, _, data, t) {
    if (data.role === undefined) {
      return <span className={mentionStyle}>@role</span>;
    } else if (!data.role) {
      return (
        <span>
          @<Trans t={t} i18nKey="mention.deletedRole" />
        </span>
      );
    }

    const [red, green, blue] = getRgbComponents(data.role.color);

    return (
      <span
        className={data.role.color ? coloredMentionStyle : mentionStyle}
        // @ts-expect-error Tailwind var
        style={{ "--color": `${red} ${green} ${blue}` }}
      >
        @{data.role.name}
      </span>
    );
  },
});

const commandMentionRule = defineRule({
  capture(source) {
    const match =
      /^<\/((?:[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32})(?: [-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}){0,2}):(\d+)>/u.exec(
        source,
      );
    if (!match) return;
    return {
      size: match[0].length,
      name: match[1],
      id: match[2],
    };
  },
  render(capture) {
    return <span className={actionableMentionStyle}>/{capture.name}</span>;
  },
});

const emojiStyle =
  "inline size-[1.375em] object-contain [[data-large-emoji]_&]:size-[calc(var(--font-size)*3)]";

const customEmojiRule = defineRule({
  capture(source) {
    const match = /^<(a)?:(\w+):(\d+)>/.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      name: match[2],
      id: match[3],
      animated: Boolean(match[1]),
    };
  },
  render(capture) {
    return (
      <img
        src={cdn.emoji(capture.id, capture.animated ? "gif" : "webp")}
        alt={capture.name}
        title={capture.name}
        className={emojiStyle}
      />
    );
  },
});

const unicodeEmojiRule = defineRule({
  capture(source) {
    const { content, offset, name } = translateNamedEmoji(source);
    const emoji = findEmoji(content);
    if (!emoji) return;
    return {
      size: offset + emoji.length,
      emoji,
      name: `:${name ?? getEmojiName(emoji)}:`,
    };
  },
  render(capture) {
    return <Twemoji emoji={capture.emoji} className={emojiStyle} />;
  },
});

const textRule = defineRule({
  capture(source) {
    const match = /^(?:[\p{L}\p{M}\p{N}\p{Z}]+|¯\\_\(ツ\)_\/¯)/su.exec(source);
    if (!match) {
      return {
        size: 1,
        content: source[0],
      };
    }

    const content = trimToNearestNonSymbolEmoji(match[0]);
    return {
      size: content.length,
      content,
    };
  },
  render(capture) {
    return capture.content;
  },
});

type RuleOptionKey =
  | "headings"
  | "footings"
  | "codeBlocks"
  | "inlineCode"
  | "blockQuotes"
  | "lists"
  | "paragraphs"
  | "escapes"
  | "references"
  | "links"
  | "autoLinks"
  | "maskedImageLinks"
  | "maskedLinks"
  | "italic"
  | "bold"
  | "underline"
  | "strikethrough"
  | "breaks"
  | "spoilers"
  | "timestamps"
  | "globalMentions"
  | "guildSectionMentions"
  | "channelMentions"
  | "memberMentions"
  | "roleMentions"
  | "commandMentions"
  | "customEmojis"
  | "unicodeEmojis"
  | "text";

export const ruleOptions: Record<
  RuleOptionKey,
  { rule: Rule; title?: boolean; full?: boolean }
> = {
  headings: { rule: headingRule, full: true },
  footings: { rule: footingRule, full: true },
  codeBlocks: { rule: codeBlockRule, full: true },
  inlineCode: { rule: codeRule, title: true, full: true },
  blockQuotes: { rule: blockQuoteRule, full: true },
  lists: { rule: listRule, full: true },
  paragraphs: { rule: paragraphRule, title: true, full: true },
  escapes: { rule: escapeRule, title: true, full: true },
  references: { rule: referenceRule, full: true },
  links: { rule: linkRule, title: true, full: true },
  autoLinks: { rule: autoLinkRule, title: true, full: true },
  maskedImageLinks: { rule: maskedImageLinkRule },
  maskedLinks: { rule: maskedLinkRule, full: true },
  italic: { rule: emphasisRule, title: true, full: true },
  bold: { rule: strongRule, title: true, full: true },
  underline: { rule: underlineRule, title: true, full: true },
  strikethrough: { rule: strikethroughRule, title: true, full: true },
  breaks: { rule: breakRule, title: true, full: true },
  spoilers: { rule: spoilerRule, title: true, full: true },
  timestamps: { rule: timestampRule, title: true, full: true },
  globalMentions: { rule: globalMentionRule, full: true },
  guildSectionMentions: {
    rule: guildSectionMentionRule,
    title: true,
    full: true,
  },
  channelMentions: { rule: channelMentionRule, title: true, full: true },
  memberMentions: { rule: memberMentionRule, full: true },
  roleMentions: { rule: roleMentionRule, full: true },
  commandMentions: { rule: commandMentionRule, full: true },
  customEmojis: { rule: customEmojiRule, title: true, full: true },
  unicodeEmojis: { rule: unicodeEmojiRule, title: true, full: true },
  text: { rule: textRule, title: true, full: true },
};

export type MarkdownFeatures = "title" | "full";

export type FeatureConfig =
  | MarkdownFeatures
  | (Partial<Record<RuleOptionKey, boolean>> & { extend?: MarkdownFeatures });

const extendable: Record<MarkdownFeatures, RuleOptionKey[]> = {
  full: Object.entries(ruleOptions)
    .filter((pair) => pair[1].full)
    .map((pair) => pair[0] as RuleOptionKey),
  title: Object.entries(ruleOptions)
    .filter((pair) => pair[1].title)
    .map((pair) => pair[0] as RuleOptionKey),
};

const getRules = (features: FeatureConfig) => {
  let rules: Rule[];
  if (typeof features === "string") {
    rules = extendable[features].map((key) => ruleOptions[key].rule);
  } else {
    const { extend, ...ft } = features;
    const enabledKeys = extend
      ? [
          ...extendable[extend].filter((key) => ft[key] !== false),
          ...Object.keys(ruleOptions).filter(
            (key) => ft[key as RuleOptionKey] === true,
          ),
        ]
      : Object.entries(ft)
          .filter((pair) => pair[1])
          .map((pair) => pair[0]);

    rules = Object.entries(ruleOptions)
      .filter((pair) => enabledKeys.includes(pair[0]))
      .map((pair) => pair[1].rule);
  }

  return rules;
};

export const getEnabledRuleKeys = (
  features: FeatureConfig,
): RuleOptionKey[] => {
  let keys: RuleOptionKey[];
  if (typeof features === "string") {
    keys = extendable[features];
  } else {
    const { extend, ...ft } = features;
    keys = extend
      ? [
          ...extendable[extend].filter((key) => ft[key] !== false),
          ...Object.keys(ruleOptions).filter(
            (key): key is RuleOptionKey => ft[key as RuleOptionKey] === true,
          ),
        ]
      : Object.entries(ft)
          .filter((pair) => pair[1])
          .map((pair) => pair[0] as RuleOptionKey);
  }

  return keys;
};

/**
 * Emulate what Discord silently does to strings before saving the data
 */
const trimContent = (text: string) => {
  return text.trim();
};

export const Markdown: React.FC<{
  content: string;
  features?: FeatureConfig;
  cache?: CacheManager;
}> = ({ content, features, cache }) => {
  const { t } = useTranslation();
  const parse = createMarkdownParser(getRules(features ?? "full"));
  const result = parse(trimContent(content));

  const resolver = {
    resolved: cache?.state,
  };

  useEffect(() => {
    if (result.requests.size > 0 && cache) {
      cache.resolveMany(result.requests);
    }
  }, [result, cache]);

  return <div>{renderMarkdownNodes(result.nodes, resolver.resolved, t)}</div>;
};

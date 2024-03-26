// This file is a fork of @maddymeow's work on Discohook (AGPL 3.0) - thank you
// https://github.com/discohook/site

import { Trans } from "react-i18next";
import { twJoin, twMerge } from "tailwind-merge";
import { cdn } from "~/util/discord";
import { highlightCode } from "~/util/highlighting";
import { getRelativeDateFormat } from "~/util/markdown/dates";
import {
  findEmoji,
  getEmojiImageUrl,
  getEmojiName,
  translateNamedEmoji,
  trimToNearestNonSymbolEmoji,
} from "~/util/markdown/emoji";
import { getRgbComponents } from "~/util/text";

export type Resolutions = {
  [key: `channel:${string}`]: ResolvedChannel | undefined | null;
  [key: `member:${string}`]: ResolvedMember | undefined | null;
  [key: `role:${string}`]: ResolvedRole | undefined | null;
};

export type ResolvedChannel = {
  name: string;
  type: "text" | "voice" | "thread" | "forum" | "post";
};

export type ResolvedMember = {
  name: string;
};

export type ResolvedRole = {
  name: string;
  color: number;
};

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
) {
  const elements: (JSX.Element | string)[] = [];

  for (const node of nodes) {
    const rendered = node.rule.render(
      node.capture,
      (nodes) => renderMarkdownNodes(nodes, data),
      data && node.data
        ? Object.fromEntries(
            Object.entries(node.data).map(([key, request]) => {
              return [key, data[request as keyof Resolutions]];
            }),
          )
        : {},
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

    const codeStyle =
      "block overflow-x-auto whitespace-pre-wrap rounded border border-primary-200 bg-primary-130 p-[0.5em] indent-0 font-code text-[calc(var(--font-size)*0.875)] leading-[calc(var(--font-size)*1.125)] text-primary-600 dark:border-primary-700 dark:bg-primary-630 dark:text-primary-230 [[data-embed]_&]:border-none [[data-embed]_&]:bg-primary-200 dark:[[data-embed]_&]:bg-primary-700";

    return (
      <pre className="mt-[6px] max-w-[90%] bg-clip-border">
        {html ? (
          <code
            className={codeStyle}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: highlightCode generates HTML w/ highlight.js
            dangerouslySetInnerHTML={{ __html: html.value }}
          />
        ) : (
          <code className={codeStyle}>{capture.content}</code>
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

const mentionStyle =
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
  render(capture) {
    return (
      <span className={actionableMentionStyle}>
        {capture.message ?? capture.channel}
      </span>
    );
  },
});

export const linkClassName = twMerge(
  "text-blue-430 [word-break:break-word] hover:underline dark:text-blue-345",
);

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
      url: match[1],
    };
  },
  render(capture) {
    const url = new URL(capture.url).href;
    return (
      <a
        href={url}
        className={linkClassName}
        rel="noreferrer noopener nofollow ugc"
        target="_blank"
      >
        {url}
      </a>
    );
  },
});

const autoLinkRule = defineRule({
  capture(source) {
    const match = /^https?:\/\/[^\s<]+[^\s"',.:;<\]]/.exec(source);
    if (!match) return;
    try {
      new URL(match[0]);
    } catch {
      return;
    }

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

    return {
      size: url.length,
      url: new URL(url).href,
    };
  },
  render(capture) {
    const url = new URL(capture.url).href;
    return (
      <a
        href={url}
        className="text-blue-430 [word-break:break-word] hover:underline dark:text-blue-345"
        rel="noreferrer noopener nofollow ugc"
        target="_blank"
      >
        {url}
      </a>
    );
  },
});

const maskedLinkRule = defineRule({
  capture(source, _, parse) {
    const match =
      /^\[((?:\[[^\]]*\]|[^[\]]|\](?=[^[]*\]))*)\]\(\s*<?((?:\([^)]*\)|[^\s\\]|\\.)*?)>?(?:\s+['"](.*?)['"])?\s*\)/su.exec(
        source,
      );
    if (!match) return;
    try {
      new URL(match[2]);
    } catch {
      return;
    }

    return {
      size: match[0].length,
      content: parse(match[1]),
      url: new URL(match[2]).href,
      title: match[3],
    };
  },
  render(capture, render) {
    return (
      <a
        href={capture.url}
        title={capture.title}
        className="text-blue-430 [word-break:break-word] hover:underline dark:text-blue-345"
        rel="noreferrer noopener nofollow ugc"
        target="_blank"
      >
        {render(capture.content)}
      </a>
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

const codeRule = defineRule({
  capture(source) {
    const match = /^(`+)(.*?[^`])\1(?!`)/su.exec(source);
    if (!match) return;
    return {
      size: match[0].length,
      content: match[1],
    };
  },
  render(capture) {
    return (
      <code className="my-[-0.2em] size-auto whitespace-pre-wrap rounded-[3px] bg-primary-130 p-[0.2em] indent-0 font-code text-[length:0.85em] leading-[calc(var(--font-size)*1.125)] dark:bg-primary-630">
        {capture.content}
      </code>
    );
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

const timestampFormats = {
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
  render(capture) {
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
          i18nKey={`timestamp.${format}`}
          values={{ date: capture.date, n }}
        />
      </span>
    );
  },
});

const channelIconStyle =
  "mb-[calc(var(--font-size)*0.2)] inline size-[--font-size] align-middle";
const channelIcons = {
  // text: () => <TextChannelIcon className={channelIconStyle} />,
  // voice: () => <VoiceChannelIcon className={channelIconStyle} />,
  // thread: () => <ThreadChannelIcon className={channelIconStyle} />,
  // forum: () => <ForumChannelIcon className={channelIconStyle} />,
  // post: () => <PostChannelIcon className={channelIconStyle} />,
  text: () => <div className={channelIconStyle} />,
  voice: () => <div className={channelIconStyle} />,
  thread: () => <div className={channelIconStyle} />,
  forum: () => <div className={channelIconStyle} />,
  post: () => <div className={channelIconStyle} />,
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
  render(_capture, _, data) {
    if (data.channel === undefined) {
      <span className={actionableMentionStyle}>
        {channelIcons.text()}channel
      </span>;
    }

    return (
      <span className={actionableMentionStyle}>
        {channelIcons[data.channel?.type ?? "text"]()}
        {data.channel?.name ?? <span className="italic">Unknown</span>}
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
      member: `member:${capture.id}`,
    };
  },
  render(capture, _, data) {
    if (data.member === undefined) {
      <span className={actionableMentionStyle}>@member</span>;
    }

    return (
      <span className={actionableMentionStyle}>
        {data.member ? `@${data.member?.name}` : `<@${capture.id}>`}
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
  render(capture, _, data) {
    if (data.role === undefined) {
      return <span className={mentionStyle}>@role</span>;
    } else if (!data.role) {
      return "@deleted-role";
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
    return (
      <img
        src={getEmojiImageUrl(capture.emoji)}
        alt={capture.emoji}
        title={capture.name}
        className={emojiStyle}
      />
    );
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

function getRules(type: keyof typeof parsers) {
  return [
    type === "full" ? headingRule : undefined,
    type === "full" ? codeBlockRule : undefined,
    type === "full" ? blockQuoteRule : undefined,
    type === "full" ? listRule : undefined,
    type === "full" ? paragraphRule : undefined,
    escapeRule,
    type === "full" ? referenceRule : undefined,
    linkRule,
    autoLinkRule,
    maskedLinkRule,
    emphasisRule,
    strongRule,
    underlineRule,
    strikethroughRule,
    codeRule,
    breakRule,
    spoilerRule,
    type === "full" ? timestampRule : undefined,
    type === "full" ? globalMentionRule : undefined,
    type === "full" ? channelMentionRule : undefined,
    type === "full" ? memberMentionRule : undefined,
    type === "full" ? roleMentionRule : undefined,
    type === "full" ? commandMentionRule : undefined,
    customEmojiRule,
    unicodeEmojiRule,
    textRule,
  ]
    .filter(Boolean)
    .map((x) => x as NonNullable<typeof x>);
}

const parseFullMarkdown = createMarkdownParser(getRules("full"));
const parseTitleMarkdown = createMarkdownParser(getRules("title"));

const parsers = {
  full: parseFullMarkdown,
  title: parseTitleMarkdown,
};

export const Markdown: React.FC<{
  content: string;
  features?: keyof typeof parsers;
}> = ({ content, features }) => {
  const parse = parsers[features ?? "full"];
  const result = parse(content);

  const resolver = { resolved: undefined };

  // watchEffect(() => {
  //   if (result.value.requests.size > 0) {
  //     resolver.request(result.value.requests);
  //   }
  // });

  return <div>{renderMarkdownNodes(result.nodes, resolver.resolved)}</div>;
};

import { ButtonStyle } from "discord-api-types/v10";
import { useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twMerge } from "tailwind-merge";
import { Button } from "~/components/Button";
import { Checkbox } from "~/components/Checkbox";
import { StringSelect } from "~/components/StringSelect";
import { codeBlockStyle, linkClassName } from "~/components/preview/Markdown";
import { QueryData } from "~/types/QueryData";
import { APIEmbed } from "~/types/QueryData-raw";
import { cycleCopyText } from "~/util/text";
import { Modal, ModalFooter, ModalProps, PlainModalHeader } from "./Modal";

export type CodeGeneratorData = Pick<
  QueryData["messages"][number]["data"],
  "embeds" // | "poll"
>;

export interface CodeGeneratorPreferences {
  quoteStyle?: "double" | "single";
  colorSpelling?: "color" | "colour";
}

const quoteString = (
  text: string,
  preferences: Pick<CodeGeneratorPreferences, "quoteStyle">,
) => {
  const q = preferences.quoteStyle === "single" ? "'" : '"';
  return q + text.replaceAll(q, `\\${q}`).replaceAll("\n", "\\n") + q;
};

type DiscordLibrary = "djs14" | "dpy2";

// I don't know if there's a proper way to "do code gen" but this seemed
// reasonably sensible to me since there's a pretty limited amount of
// output
const codegen: Record<
  DiscordLibrary,
  (
    data: CodeGeneratorData,
    preferences: CodeGeneratorPreferences,
  ) => { imports?: string[]; code: string[]; documentation: string }
> = {
  djs14(data, preferences) {
    const imports: string[] = [];
    const packages: string[] = [];
    const lines: string[] = [];

    const singleEmbedDeclaration = (embed: APIEmbed) => {
      const lines = ["new EmbedBuilder()"];
      if (embed.color != null) {
        lines.push(`    .setColor(${embed.color})`);
      }
      if (embed.title) {
        lines.push(`    .setTitle(${quoteString(embed.title, preferences)})`);
      }
      if (embed.url) {
        lines.push(`    .setURL(${quoteString(embed.url, preferences)})`);
      }
      if (embed.description) {
        lines.push(
          `    .setDescription(${quoteString(embed.description, preferences)})`,
        );
      }
      if (embed.timestamp) {
        lines.push(
          `    .setTimestamp(new Date(${quoteString(
            embed.timestamp,
            preferences,
          )})`,
        );
      }
      if (embed.author?.name) {
        lines.push(
          "    .setAuthor({",
          `        name: ${quoteString(embed.author.name, preferences)},`,
        );
        if (embed.author.url) {
          lines.push(
            `        url: ${quoteString(embed.author.url, preferences)},`,
          );
        }
        if (embed.author.icon_url) {
          lines.push(
            `        icon_url: ${quoteString(
              embed.author.icon_url,
              preferences,
            )},`,
          );
        }
        lines.push("})");
      }
      if (embed.thumbnail?.url) {
        lines.push(
          `    .setThumbnail(${quoteString(embed.thumbnail.url, preferences)})`,
        );
      }
      if (embed.image?.url) {
        lines.push(
          `    .setImage(${quoteString(embed.image.url, preferences)})`,
        );
      }
      if (embed.footer?.text) {
        lines.push(
          "    .setFooter({",
          `        text: ${quoteString(embed.footer.text, preferences)},`,
        );
        if (embed.footer.icon_url) {
          lines.push(
            `        icon_url: ${quoteString(
              embed.footer.icon_url,
              preferences,
            )},`,
          );
        }
        lines.push("    })");
      }
      if (embed.fields) {
        lines.push("    .setFields(");
        for (const field of embed.fields) {
          lines.push(
            "        {",
            `            name: ${quoteString(field.name, preferences)},`,
            `            value: ${quoteString(field.value, preferences)},`,
            `            inline: ${field.inline ? "true" : "false"},`,
            "        },",
          );
        }
        lines.push("    )");
      }
      return lines;
    };

    if (data.embeds) {
      packages.push("EmbedBuilder");
      if (data.embeds.length === 1) {
        const embedLines = singleEmbedDeclaration(data.embeds[0]);
        embedLines[0] = `const embed = ${embedLines[0]}`;
        embedLines[embedLines.length - 1] += ";";
        lines.push(...embedLines);
      } else {
        lines.push("const embeds = [");
        for (const embed of data.embeds) {
          const embedLines = singleEmbedDeclaration(embed);
          embedLines[embedLines.length - 1] += ",";
          for (const embedLine of embedLines) {
            lines.push(`    ${embedLine}`);
          }
        }
        lines.push("];");
      }
    }

    if (packages.length !== 0) {
      imports.push(`import { ${packages.join(", ")} } from "discord.js";`);
    }

    return {
      imports,
      code: lines,
      documentation:
        "https://discord.js.org/docs/packages/builders/main/EmbedBuilder:Class",
    };
  },
  dpy2(data, preferences) {
    const imports = ["import discord"];
    const lines: string[] = [];
    const colorKw = preferences.colorSpelling ?? "color";

    const singleEmbedDeclaration = (embed: APIEmbed) => {
      const kwargs: string[] = [];
      if (embed.color != null) {
        kwargs.push(`${colorKw}=${embed.color}`);
      }
      if (embed.url) {
        kwargs.push(`url=${quoteString(embed.url, preferences)}`);
      }
      if (embed.title) {
        kwargs.push(`title=${quoteString(embed.title, preferences)}`);
      }
      if (embed.description) {
        kwargs.push(
          `description=${quoteString(embed.description, preferences)}`,
        );
      }
      if (embed.timestamp) {
        if (!imports.includes("import datetime")) {
          imports.push("import datetime");
        }

        const ts = new Date(embed.timestamp);
        kwargs.push(
          `timestamp=datetime.datetime(${ts.getUTCFullYear()}, ${
            ts.getUTCMonth() + 1
          }, ${ts.getUTCDate()}, ${ts.getUTCHours()}, ${ts.getUTCMinutes()}, ${ts.getUTCSeconds()}, tzinfo=datetime.timezone.utc)`,
        );
      }

      const lines: string[] = [];
      if (kwargs.length === 0) {
        lines.push("discord.Embed()");
      } else {
        lines.push("discord.Embed(", ...kwargs.map((kw) => `    ${kw},`), ")");
      }

      if (embed.author?.name) {
        lines.push(
          "    .set_author(",
          `        name=${quoteString(embed.author.name, preferences)},`,
        );
        if (embed.author.url) {
          lines.push(
            `        url=${quoteString(embed.author.url, preferences)},`,
          );
        }
        if (embed.author.icon_url) {
          lines.push(
            `        icon_url=${quoteString(
              embed.author.icon_url,
              preferences,
            )},`,
          );
        }
        lines.push("    )");
      }
      if (embed.thumbnail?.url) {
        lines.push(
          `    .set_thumbnail(url=${quoteString(
            embed.thumbnail.url,
            preferences,
          )})`,
        );
      }
      if (embed.image?.url) {
        lines.push(
          `    .set_image(url=${quoteString(embed.image.url, preferences)})`,
        );
      }
      if (embed.footer?.text) {
        lines.push(
          "    .set_footer(",
          `        text=${quoteString(embed.footer.text, preferences)},`,
        );
        if (embed.footer.icon_url) {
          lines.push(
            `        icon_url=${quoteString(
              embed.footer.icon_url,
              preferences,
            )},`,
          );
        }
        lines.push("    )");
      }
      if (embed.fields) {
        for (const field of embed.fields) {
          lines.push(
            "    .add_field(",
            `        name=${quoteString(field.name, preferences)},`,
            `        value=${quoteString(field.value, preferences)},`,
            `        inline=${field.inline ? "True" : "False"},`,
            "    )",
          );
        }
      }
      return lines;
    };

    if (data.embeds) {
      if (data.embeds.length === 1) {
        const embedLines = singleEmbedDeclaration(data.embeds[0]);
        embedLines[0] = `embed = ${embedLines[0]}`;
        lines.push(...embedLines);
      } else {
        lines.push("embeds = [");
        for (const embed of data.embeds) {
          const embedLines = singleEmbedDeclaration(embed);
          embedLines[embedLines.length - 1] += ",";
          for (const embedLine of embedLines) {
            lines.push(`    ${embedLine}`);
          }
        }
        lines.push("]");
      }
    }

    return {
      imports,
      code: lines,
      documentation: "https://discordpy.readthedocs.io/en/stable/api.html",
    };
  },
};

const libraryOptions: { label: string; value: DiscordLibrary }[] = [
  {
    label: "discord.js v14",
    value: "djs14",
  },
  {
    label: "discord.py v2",
    value: "dpy2",
  },
];

export type CodeGeneratorProps = { data: Partial<CodeGeneratorData> };

export const CodeGeneratorModal = (props: ModalProps & CodeGeneratorProps) => {
  const { t } = useTranslation();
  console.log(props);

  const [wordWrap, setWordWrap] = useState(false);
  const [library, setLibrary] = useState<DiscordLibrary>("dpy2");

  const generated = useMemo(() => {
    const { imports, code, ...rest } = codegen[library](props.data, {});
    return {
      imports:
        imports && imports.length === 0 ? undefined : imports?.join("\n"),
      code: code.join("\n"),
      ...rest,
    };
  }, [library, props.data]);

  return (
    <Modal {...props}>
      <PlainModalHeader>{t("codeGenerator")}</PlainModalHeader>
      <StringSelect
        label={t("library")}
        options={libraryOptions}
        value={libraryOptions.find((o) => o.value === library)}
        onChange={(o) => {
          const opt = o as (typeof libraryOptions)[number];
          setLibrary(opt.value);
        }}
      />
      <p className="cursor-default text-sm mt-2">{t("imports")}</p>
      {generated.imports ? (
        <pre className="w-full bg-clip-border text-sm">
          <code className={codeBlockStyle}>{generated.imports}</code>
        </pre>
      ) : (
        t("noImports")
      )}
      <p className="cursor-default text-sm mt-2">{t("code")}</p>
      <pre className="w-full bg-clip-border text-sm">
        <code
          className={twMerge(
            codeBlockStyle,
            wordWrap ? "whitespace-pre-wrap" : "whitespace-pre",
          )}
        >
          {generated.code}
        </code>
      </pre>
      <p className="text-sm text-muted dark:text-muted-dark">
        <Trans
          t={t}
          i18nKey="codeNote"
          components={{
            docs: (
              // biome-ignore lint/a11y/useAnchorContent: Content supplied by i18next
              <a
                href={generated.documentation}
                className={linkClassName}
                target="_blank"
                rel="noreferrer"
              />
            ),
          }}
          values={{
            library:
              libraryOptions.find((o) => o.value === library)?.label ?? library,
          }}
        />
      </p>
      <div className="mt-4">
        <Checkbox
          label={t("wordWrap")}
          checked={wordWrap}
          onChange={(e) => setWordWrap(e.currentTarget.checked)}
        />
      </div>
      <ModalFooter className="flex gap-2 flex-wrap">
        <Button
          discordstyle={ButtonStyle.Secondary}
          onClick={(e) =>
            cycleCopyText(generated.imports ?? "", t, e.currentTarget)
          }
          disabled={!generated.imports}
        >
          {t("copyImports")}
        </Button>
        <Button
          discordstyle={ButtonStyle.Secondary}
          onClick={(e) => cycleCopyText(generated.code, t, e.currentTarget)}
        >
          {t("copyCode")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

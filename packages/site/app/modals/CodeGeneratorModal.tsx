import type {
  APIButtonComponent,
  APIContainerComponent,
  APIFileComponent,
  APIMediaGalleryComponent,
  APIMessageComponent,
  APISectionComponent,
  APISeparatorComponent,
  APITextDisplayComponent,
  APIThumbnailComponent,
} from "discord-api-types/v10";
import {
  ButtonStyle,
  ComponentType,
  SeparatorSpacingSize,
} from "discord-api-types/v10";
import { useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twMerge } from "tailwind-merge";
import { Button } from "~/components/Button";
import { Checkbox } from "~/components/Checkbox";
import { codeBlockStyle, linkClassName } from "~/components/preview/Markdown";
import { StringSelect } from "~/components/StringSelect";
import type { QueryData } from "~/types/QueryData";
import type { APIEmbed } from "~/types/QueryData-raw";
import { cycleCopyText } from "~/util/text";
import { Modal, ModalFooter, type ModalProps, PlainModalHeader } from "./Modal";

export type CodeGeneratorData = Pick<
  QueryData["messages"][number]["data"],
  "embeds" | "components" // | "poll"
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

const indentList = (arr: string[], spaces: number) =>
  arr.map((line) => `${" ".repeat(spaces)}${line}`);

type DiscordLibrary = "djs14" | "dpy2";

// Helper functions for display component code generation
const generateTextDisplayCode = (
  component: APITextDisplayComponent,
  preferences: CodeGeneratorPreferences,
  omitBuilder = false,
): string[] => {
  const lines = omitBuilder ? [] : ["new TextDisplayBuilder()"];
  lines.push(`    .setContent(${quoteString(component.content, preferences)})`);
  if (component.id) {
    lines.push(`    .setId(${component.id})`);
  }
  return lines;
};

const generateMediaGalleryCode = (
  component: APIMediaGalleryComponent,
  preferences: CodeGeneratorPreferences,
  omitBuilder = false,
): string[] => {
  const lines = omitBuilder ? [] : ["new MediaGalleryBuilder()"];

  if (component.items && component.items.length > 0) {
    lines.push("    .addItems(");
    for (const item of component.items) {
      const itemLines = [
        "(mediaGalleryItem) => mediaGalleryItem",
        `    .setURL(${quoteString(item.media.url, preferences)})`,
      ];

      if (item.description) {
        itemLines.push(
          `    .setDescription(${quoteString(item.description, preferences)})`,
        );
      }
      if (item.spoiler) {
        itemLines.push("    .setSpoiler(true)");
      }

      if (component.items.length !== 0) {
        itemLines[itemLines.length - 1] += ",";
      }
      lines.push(...indentList(itemLines, 8));
    }
    lines.push("    )");
  }

  if (component.id) {
    lines.push(`    .setId(${component.id})`);
  }
  return lines;
};

const generateFileCode = (
  component: APIFileComponent,
  preferences: CodeGeneratorPreferences,
  omitBuilder = false,
): string[] => {
  const lines = omitBuilder ? [] : ["new FileBuilder()"];
  lines.push(`    .setURL(${quoteString(component.file.url, preferences)})`);
  if (component.id) {
    lines.push(`    .setId(${component.id})`);
  }
  return lines;
};

const generateSeparatorCode = (
  component: APISeparatorComponent,
  _preferences: CodeGeneratorPreferences,
  omitBuilder = false,
): string[] => {
  const lines = omitBuilder ? [] : ["new SeparatorBuilder()"];

  if (component.divider === false) {
    lines.push("    .setDivider(false)");
  } else {
    lines.push("    .setDivider(true)");
  }

  if (component.spacing !== undefined) {
    lines.push(
      `    .setSpacing(SeparatorSpacingSize.${SeparatorSpacingSize[component.spacing]})`,
    );
  }

  if (component.id) {
    lines.push(`    .setId(${component.id})`);
  }
  return lines;
};

const generateSectionCode = (
  component: APISectionComponent,
  preferences: CodeGeneratorPreferences,
  omitBuilder = false,
): string[] => {
  const lines = omitBuilder ? [] : ["new SectionBuilder()"];

  if (component.components && component.components.length > 0) {
    lines.push(
      "    .addTextDisplayComponents(",
      "        (textDisplay) => textDisplay",
    );
    for (let i = 0; i < component.components.length; i++) {
      const textDisplay = component.components[i];
      const itemLines = [
        `.setContent(${quoteString(textDisplay.content, preferences)})`,
      ];

      if (textDisplay.id) {
        itemLines.push(`.setId(${textDisplay.id})`);
      }

      if (component.components.length !== 0) {
        itemLines[itemLines.length - 1] += ",";
      }
      lines.push(...indentList(itemLines, 12));
    }
    lines.push("    )");
  }

  // Handle accessory (button or thumbnail)
  if (component.accessory) {
    if (component.accessory.type === ComponentType.Button) {
      const button = component.accessory as APIButtonComponent;
      lines.push("    .setButtonAccessory((button) => button");
      if ("style" in button) {
        lines.push(
          `        .setStyle(ButtonStyle.${ButtonStyle[button.style]})`,
        );
      }
      if ("url" in button && button.url) {
        lines.push(`        .setURL(${quoteString(button.url, preferences)})`);
      } else if ("custom_id" in button) {
        lines.push(
          `        .setCustomId(${quoteString(button.custom_id, preferences)})`,
        );
      } else if ("sku_id" in button) {
        lines.push(
          `        .setSKUId(${quoteString(button.sku_id, preferences)})`,
        );
      }
      if ("label" in button && button.label) {
        lines.push(
          `        .setLabel(${quoteString(button.label, preferences)})`,
        );
      }
      if ("disabled" in button && button.disabled) {
        lines.push("        .setDisabled(true)");
      }
      if ("emoji" in button && button.emoji) {
        lines.push(`        .setEmoji(${JSON.stringify(button.emoji)})`);
      }
      lines.push("    )");
    } else if (component.accessory.type === ComponentType.Thumbnail) {
      const thumbnail = component.accessory as APIThumbnailComponent;
      lines.push("    .setThumbnailAccessory((thumbnail) => thumbnail");
      lines.push(
        `        .setURL(${quoteString(thumbnail.media.url, preferences)})`,
      );
      if (thumbnail.description) {
        lines.push(
          `        .setDescription(${quoteString(thumbnail.description, preferences)})`,
        );
      }
      if (thumbnail.spoiler) {
        lines.push("        .setSpoiler(true)");
      }
      lines.push("    )");
    }
  }

  if (component.id) {
    lines.push(`    .setId(${component.id})`);
  }
  return lines;
};

const generateContainerCode = (
  component: APIContainerComponent,
  preferences: CodeGeneratorPreferences,
  packages: Set<string>,
): string[] => {
  const lines = ["new ContainerBuilder()"];

  if (component.accent_color) {
    lines.push(`    .setAccentColor(${component.accent_color})`);
  }

  if (component.spoiler) {
    lines.push("    .setSpoiler(true)");
  }

  if (component.components && component.components.length > 0) {
    for (const child of component.components) {
      switch (child.type) {
        case ComponentType.TextDisplay:
          lines.push(
            "    .addTextDisplayComponents((textDisplay) => textDisplay",
          );
          lines.push(
            ...indentList(generateTextDisplayCode(child, preferences, true), 4),
          );
          lines.push("    )");
          break;
        case ComponentType.Section:
          lines.push("    .addSectionComponents((section) => section");
          lines.push(
            ...indentList(generateSectionCode(child, preferences, true), 4),
          );
          lines.push("    )");
          break;
        case ComponentType.Separator:
          lines.push("    .addSeparatorComponents((separator) => separator");
          lines.push(
            ...indentList(generateSeparatorCode(child, preferences, true), 4),
          );
          lines.push("    )");
          break;
        case ComponentType.File:
          packages.add("FileBuilder");
          lines.push("    .addFileComponents((file) => file");
          lines.push(
            ...indentList(generateFileCode(child, preferences, true), 4),
          );
          lines.push("    )");
          break;
        case ComponentType.MediaGallery:
          lines.push("    .addMediaGalleryComponents((gallery) => gallery");
          lines.push(
            ...indentList(
              generateMediaGalleryCode(child, preferences, true),
              4,
            ),
          );
          lines.push("    )");
          break;
        default:
          break;
      }
    }
  }

  if (component.id) {
    lines.push(`    .setId(${component.id})`);
  }
  return lines;
};

const singleComponentDeclaration = (
  component: APIMessageComponent,
  packages: Set<string>,
  preferences: CodeGeneratorPreferences,
) => {
  switch (component.type) {
    case ComponentType.TextDisplay:
      packages.add("TextDisplayBuilder");
      return generateTextDisplayCode(component, preferences);
    case ComponentType.Section:
      packages.add("SectionBuilder");
      return generateSectionCode(component, preferences);
    case ComponentType.Container:
      packages.add("ContainerBuilder");
      return generateContainerCode(component, preferences, packages);
    case ComponentType.Separator:
      packages.add("SeparatorBuilder");
      return generateSeparatorCode(component, preferences);
    case ComponentType.File:
      packages.add("FileBuilder");
      return generateFileCode(component, preferences);
    case ComponentType.MediaGallery:
      packages.add("MediaGalleryBuilder");
      return generateMediaGalleryCode(component, preferences);
    default:
      return [];
  }
};

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
    const packages = new Set<string>();
    const lines: string[] = [];

    // Handle display components (Components-based Message)
    let hasDisplayComponents = false;
    if (data.components && data.components.length !== 0) {
      hasDisplayComponents = data.components.some((comp) =>
        [
          ComponentType.TextDisplay,
          ComponentType.Section,
          ComponentType.Container,
          ComponentType.Separator,
          ComponentType.File,
          ComponentType.MediaGallery,
        ].includes(comp.type),
      );

      if (hasDisplayComponents) {
        if (data.components.length === 1) {
          const componentLines = singleComponentDeclaration(
            data.components[0],
            packages,
            preferences,
          );
          componentLines[0] = `const component = ${componentLines[0]}`;
          componentLines[componentLines.length - 1] += ";";
          lines.push(...componentLines);
        } else {
          lines.push("const components = [");
          for (const component of data.components) {
            const componentLines = singleComponentDeclaration(
              component,
              packages,
              preferences,
            );
            componentLines[componentLines.length - 1] += ",";
            lines.push(...indentList(componentLines, 4));
          }
          lines.push("];");
        }
      }
    }

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
          const { name, value, inline } = field;
          lines.push(
            "        {",
            `            name: ${quoteString(name ?? "", preferences)},`,
            `            value: ${quoteString(value ?? "", preferences)},`,
            `            inline: ${inline ? "true" : "false"},`,
            "        },",
          );
        }
        lines.push("    )");
      }
      return lines;
    };

    if (data.embeds) {
      packages.add("EmbedBuilder");
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
          lines.push(...indentList(embedLines, 4));
        }
        lines.push("];");
      }
    }

    if (packages.size !== 0) {
      imports.push(
        `import { ${Array.from(packages).sort().join(", ")} } from "discord.js";`,
      );
    }

    return {
      imports,
      code: lines,
      documentation: hasDisplayComponents
        ? "https://discord.js.org/docs/packages/builders/main/TextDisplayBuilder:Class"
        : "https://discord.js.org/docs/packages/builders/main/EmbedBuilder:Class",
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
          const { name, value, inline } = field;
          lines.push(
            "    .add_field(",
            `        name=${quoteString(name ?? "", preferences)},`,
            `        value=${quoteString(value ?? "", preferences)},`,
            `        inline=${inline ? "True" : "False"},`,
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
          onCheckedChange={(checked) => setWordWrap(checked)}
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

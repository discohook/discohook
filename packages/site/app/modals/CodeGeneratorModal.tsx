import {
  ButtonStyle,
  ComponentType,
  SeparatorSpacingSize
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
import type {
  APIContainerComponent,
  APIFileComponent,
  APIMediaGalleryComponent,
  APISectionComponent,
  APISeparatorComponent,
  APITextDisplayComponent,
  APIThumbnailComponent,
  APIButtonComponent,
} from "discord-api-types/v10";
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
): string[] => {
  const lines = ["new TextDisplayBuilder()"];
  lines.push(`    .setContent(${quoteString(component.content, preferences)})`);
  if (component.id) {
    lines.push(`    .setId(${component.id})`);
  }
  lines.push(";");
  return lines;
};

const generateThumbnailCode = (
  component: APIThumbnailComponent,
  preferences: CodeGeneratorPreferences,
): string[] => {
  const lines = ["new ThumbnailBuilder()"];
  lines.push(`    .setURL(${quoteString(component.media.url, preferences)})`);
  if (component.description) {
    lines.push(
      `    .setDescription(${quoteString(component.description, preferences)})`
    );
  }
  if (component.spoiler) {
    lines.push("    .setSpoiler(true)");
  }
  if (component.id) {
    lines.push(`    .setId(${component.id})`);
  }
  lines.push(";");
  return lines;
};

const generateMediaGalleryCode = (
  component: APIMediaGalleryComponent,
  preferences: CodeGeneratorPreferences,
): string[] => {
  const lines = ["new MediaGalleryBuilder()"];
  
  if (component.items && component.items.length > 0) {
    lines.push("    .addItems(");
    for (let i = 0; i < component.items.length; i++) {
      const item = component.items[i];
      const itemLines = [
        "(mediaGalleryItem) =>",
        "        mediaGalleryItem",
        `            .setURL(${quoteString(item.media.url, preferences)})`,
      ];
      
      if (item.description) {
        itemLines.push(
          `            .setDescription(${quoteString(item.description, preferences)})`
        );
      }
      if (item.spoiler) {
        itemLines.push("            .setSpoiler(true)");
      }
      
      const lastIdx = itemLines.length - 1;
      itemLines[lastIdx] += i === component.items.length - 1 ? "" : ",";
      
      lines.push(...indentList(itemLines, 4));
    }
    lines.push("    )");
  }
  
  if (component.id) {
    lines.push(`    .setId(${component.id})`);
  }
  lines.push(";");
  return lines;
};

const generateFileCode = (
  component: APIFileComponent,
  preferences: CodeGeneratorPreferences,
): string[] => {
  const lines = ["new FileBuilder()"];
  lines.push(`    .setURL(${quoteString(component.file.url, preferences)})`);
  if (component.id) {
    lines.push(`    .setId(${component.id})`);
  }
  lines.push(";");
  return lines;
};

const generateSeparatorCode = (
  component: APISeparatorComponent,
  preferences: CodeGeneratorPreferences,
): string[] => {
  const lines = ["new SeparatorBuilder()"];
  
  if (component.divider === false) {
    lines.push("    .setDivider(false)");
  } else {
    lines.push("    .setDivider(true)");
  }
  
  if (component.spacing) {
    const spacingName = Object.entries(SeparatorSpacingSize).find(
      ([_, v]) => v === component.spacing
    )?.[0];
    if (spacingName) {
      lines.push(`    .setSpacing(SeparatorSpacingSize.${spacingName})`);
    }
  }
  
  if (component.id) {
    lines.push(`    .setId(${component.id})`);
  }
  lines.push(";");
  return lines;
};

const generateSectionCode = (
  component: APISectionComponent,
  preferences: CodeGeneratorPreferences,
): string[] => {
  const lines = ["new SectionBuilder()"];
  
  if (component.components && component.components.length > 0) {
    lines.push("    .addTextDisplayComponents(");
    for (let i = 0; i < component.components.length; i++) {
      const textDisplay = component.components[i];
      const itemLines = [
        "(textDisplay) =>",
        "        textDisplay",
        `            .setContent(${quoteString(textDisplay.content, preferences)})`,
      ];
      
      if (textDisplay.id) {
        itemLines.push(`            .setId(${textDisplay.id})`);
      }
      
      const lastIdx = itemLines.length - 1;
      itemLines[lastIdx] += i === component.components.length - 1 ? "" : ",";
      
      lines.push(...indentList(itemLines, 4));
    }
    lines.push("    )");
  }
  
  // Handle accessory (button or thumbnail)
  if (component.accessory) {
    if (component.accessory.type === ComponentType.Button) {
      const button = component.accessory as APIButtonComponent;
      lines.push("    .setButtonAccessory((button) =>");
      const customId = "custom_id" in button ? button.custom_id : "sku_id" in button ? button.sku_id : "btn";
      lines.push(`        button.setCustomId(${quoteString(customId, preferences)})`);
      if ("label" in button && button.label) {
        lines.push(`            .setLabel(${quoteString(button.label, preferences)})`);
      }
      if ("style" in button) {
        lines.push(`            .setStyle(ButtonStyle.${ButtonStyle[button.style]})`);
      }
      if ("disabled" in button && button.disabled) {
        lines.push("            .setDisabled(true)");
      }
      if ("emoji" in button && button.emoji) {
        lines.push(`            .setEmoji(${JSON.stringify(button.emoji)})`);
      }
      lines.push("    )");
    } else if (component.accessory.type === ComponentType.Thumbnail) {
      const thumbnail = component.accessory as APIThumbnailComponent;
      lines.push("    .setThumbnailAccessory((thumbnail) =>");
      lines.push(`        thumbnail.setURL(${quoteString(thumbnail.media.url, preferences)})`);
      if (thumbnail.description) {
        lines.push(
          `            .setDescription(${quoteString(thumbnail.description, preferences)})`
        );
      }
      if (thumbnail.spoiler) {
        lines.push("            .setSpoiler(true)");
      }
      lines.push("    )");
    }
  }
  
  if (component.id) {
    lines.push(`    .setId(${component.id})`);
  }
  lines.push(";");
  return lines;
};

const generateContainerCode = (
  component: APIContainerComponent,
  preferences: CodeGeneratorPreferences,
  packages: Set<string>
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
          packages.add("TextDisplayBuilder");
          lines.push("    .addTextDisplayComponents((textDisplay) =>");
          lines.push(
            `        textDisplay.setContent(${quoteString(
              (child as APITextDisplayComponent).content,
              preferences
            )})`
          );
          if (child.id) {
            lines.push(`            .setId(${child.id})`);
          }
          lines.push("    )");
          break;
        case ComponentType.Section:
          packages.add("SectionBuilder");
          const section = child as APISectionComponent;
          lines.push("    .addSectionComponents((section) =>");
          lines.push("        section");
          if (section.components && section.components.length > 0) {
            lines.push("            .addTextDisplayComponents(");
            for (let i = 0; i < section.components.length; i++) {
              const textDisplay = section.components[i];
              lines.push(
                `                (textDisplay) => textDisplay.setContent(${quoteString(
                  textDisplay.content,
                  preferences
                )})${i === section.components.length - 1 ? "" : ","}`
              );
            }
            lines.push("            )");
          }
          if (section.accessory && section.accessory.type === ComponentType.Button) {
            const button = section.accessory as APIButtonComponent;
            lines.push("            .setButtonAccessory((button) =>");
            const customId = "custom_id" in button ? button.custom_id : "sku_id" in button ? button.sku_id : "btn";
            lines.push(`                button.setCustomId(${quoteString(customId, preferences)})`);
            if ("label" in button && button.label) {
              lines.push(
                `                    .setLabel(${quoteString(button.label, preferences)})`
              );
            }
            if ("style" in button) {
              lines.push(`                    .setStyle(ButtonStyle.${ButtonStyle[button.style]})`);
            }
            lines.push("            )");
          }
          lines.push("    )");
          break;
        case ComponentType.Separator:
          packages.add("SeparatorBuilder");
          const separator = child as APISeparatorComponent;
          lines.push("    .addSeparatorComponents((separator) => separator");
          if (separator.divider === false) {
            lines.push("        .setDivider(false)");
          }
          if (separator.spacing) {
            const spacingName = Object.entries(SeparatorSpacingSize).find(
              ([_, v]) => v === separator.spacing
            )?.[0];
            if (spacingName) {
              lines.push(
                `        .setSpacing(SeparatorSpacingSize.${spacingName})`
              );
            }
          }
          lines.push("    )");
          break;
        case ComponentType.File:
          packages.add("FileBuilder");
          const file = child as APIFileComponent;
          lines.push("    .addFileComponents((file) =>");
          lines.push(
            `        file.setURL(${quoteString(file.file.url, preferences)})`
          );
          lines.push("    )");
          break;
        case ComponentType.MediaGallery:
          packages.add("MediaGalleryBuilder");
          const gallery = child as APIMediaGalleryComponent;
          lines.push("    .addMediaGalleryComponents((gallery) =>");
          lines.push("        gallery.addItems(");
          if (gallery.items && gallery.items.length > 0) {
            for (let i = 0; i < gallery.items.length; i++) {
              const item = gallery.items[i];
              lines.push(
                `            (item) => item.setURL(${quoteString(
                  item.media.url,
                  preferences
                )})${i === gallery.items.length - 1 ? "" : ","}`
              );
            }
          }
          lines.push("        )");
          lines.push("    )");
          break;
        case ComponentType.ActionRow:
          // Standard action rows in containers - skip for now as per the initial context
          break;
        default:
          break;
      }
    }
  }
  
  if (component.id) {
    lines.push(`    .setId(${component.id})`);
  }
  lines.push(";");
  return lines;
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
    if (data.components && data.components.length !== 0) {
      packages.add("MessageFlags");
      const hasDisplayComponents = data.components.some(
        (comp) =>
          comp.type === ComponentType.TextDisplay ||
          comp.type === ComponentType.Section ||
          comp.type === ComponentType.Container ||
          comp.type === ComponentType.Separator ||
          comp.type === ComponentType.File ||
          comp.type === ComponentType.MediaGallery
      );

      if (hasDisplayComponents) {
        // Generate display component code
        const componentLines: string[] = [];
        for (const component of data.components) {
          switch (component.type) {
            case ComponentType.TextDisplay:
              packages.add("TextDisplayBuilder");
              componentLines.push(
                ...generateTextDisplayCode(
                  component as APITextDisplayComponent,
                  preferences
                )
              );
              break;
            case ComponentType.Section:
              packages.add("SectionBuilder");
              componentLines.push(
                ...generateSectionCode(
                  component as APISectionComponent,
                  preferences
                )
              );
              break;
            case ComponentType.Container:
              packages.add("ContainerBuilder");
              componentLines.push(
                ...generateContainerCode(
                  component as APIContainerComponent,
                  preferences,
                  packages
                )
              );
              break;
            case ComponentType.Separator:
              packages.add("SeparatorBuilder");
              componentLines.push(
                ...generateSeparatorCode(
                  component as APISeparatorComponent,
                  preferences
                )
              );
              break;
            case ComponentType.File:
              packages.add("FileBuilder");
              componentLines.push(
                ...generateFileCode(
                  component as APIFileComponent,
                  preferences
                )
              );
              break;
            case ComponentType.MediaGallery:
              packages.add("MediaGalleryBuilder");
              componentLines.push(
                ...generateMediaGalleryCode(
                  component as APIMediaGalleryComponent,
                  preferences
                )
              );
              break;
            default:
              break;
          }
        }

        if (componentLines.length > 0) {
          if (data.components.length === 1) {
            const lastIdx = componentLines.length - 1;
            componentLines[0] = `const component = ${componentLines[0]}`;
            componentLines[lastIdx] = componentLines[lastIdx].replace(/;$/, "");
            lines.push(...componentLines);
          } else {
            lines.push("const components = [");
            for (let i = 0; i < componentLines.length; i++) {
              const line = componentLines[i];
              const isLastLine = i === componentLines.length - 1;
              lines.push(
                `    ${line}${isLastLine && !line.includes(",") ? "," : ""}`
              );
            }
            lines.push("];");
          }

          lines.push("");
          lines.push("await channel.send({");
          if (data.components.length === 1) {
            lines.push("    components: [component],");
          } else {
            lines.push("    components,");
          }
          lines.push("    flags: MessageFlags.IsComponentsV2,");
          lines.push("});");
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
          for (const embedLine of embedLines) {
            lines.push(`    ${embedLine}`);
          }
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
      documentation:
        data.components && data.components.length > 0
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

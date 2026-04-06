import {
  type APIButtonComponent,
  type APIContainerComponent,
  type APIFileComponent,
  type APIMediaGalleryComponent,
  type APIMessageComponent,
  type APISectionComponent,
  type APISeparatorComponent,
  type APITextDisplayComponent,
  type APIThumbnailComponent,
  ButtonStyle,
  ComponentType,
  SeparatorSpacingSize,
} from "discord-api-types/v10";
import type { APIEmbed } from "~/types/QueryData-raw";
import {
  type CodeGeneratorFn,
  type CodeGeneratorPreferences,
  indentList,
  quoteString,
} from "./common";

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

const codegen: CodeGeneratorFn = (data, preferences) => {
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
      lines.push(`    .setImage(${quoteString(embed.image.url, preferences)})`);
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
};
export default codegen;

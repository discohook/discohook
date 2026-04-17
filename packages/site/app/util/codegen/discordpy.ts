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

const pybool = (value: boolean | undefined) => (value ? "True" : "False");

const generateTextDisplayCode = (
  component: APITextDisplayComponent,
  preferences: CodeGeneratorPreferences,
): string[] => {
  const lines = ["ui.TextDisplay("];
  lines.push(`    ${quoteString(component.content, preferences)},`);
  if (component.id) {
    lines.push(`    id=${component.id},`);
  }
  lines.push(")");
  return lines;
};

const generateMediaGalleryCode = (
  component: APIMediaGalleryComponent,
  preferences: CodeGeneratorPreferences,
): string[] => {
  const lines = ["ui.MediaGallery("];
  for (const item of component.items ?? []) {
    lines.push(
      "    discord.MediaGalleryItem(",
      `        ${quoteString(item.media.url, preferences)},`,
    );
    if (item.description) {
      lines.push(
        `        description=${quoteString(item.description, preferences)},`,
      );
    }
    if (item.spoiler) {
      lines.push("        spoiler=True,");
    }
    lines.push("    ),");
  }

  if (component.id) {
    lines.push(`    id=${component.id},`);
  }
  lines.push(")");
  return lines;
};

const generateFileCode = (
  component: APIFileComponent,
  preferences: CodeGeneratorPreferences,
): string[] => {
  const lines = [
    "ui.File(",
    `    ${quoteString(component.file.url, preferences)},`,
  ];
  if (component.spoiler) {
    lines.push("    spoiler=True,");
  }
  if (component.id) {
    lines.push(`    id=${component.id},`);
  }
  lines.push(")");
  return lines;
};

const generateSeparatorCode = (
  component: APISeparatorComponent,
  _preferences: CodeGeneratorPreferences,
): string[] => {
  const lines = ["ui.Separator(", `    visible=${pybool(component.divider)},`];

  if (component.spacing !== undefined) {
    lines.push(
      `    spacing=discord.SeparatorSpacing.${SeparatorSpacingSize[component.spacing].toLowerCase()},`,
    );
  }
  if (component.id) {
    lines.push(`    id=${component.id},`);
  }
  lines.push(")");
  return lines;
};

const generateSectionCode = (
  component: APISectionComponent,
  preferences: CodeGeneratorPreferences,
): string[] => {
  const lines = ["ui.Section("];
  for (const child of component.components ?? []) {
    if (child.type !== ComponentType.TextDisplay) continue;

    if (child.id !== undefined) {
      const generated = generateTextDisplayCode(child, preferences);
      generated[generated.length - 1] += ",";
      lines.push(...indentList(generated, 4));
    } else {
      // cleaner; dpy will wrap plain strings in TextDisplay automatically
      lines.push(`    ${quoteString(child.content, preferences)},`);
    }
  }

  // Handle accessory (button or thumbnail)
  if (component.accessory) {
    if (component.accessory.type === ComponentType.Button) {
      const button = component.accessory as APIButtonComponent;
      lines.push("    accessory=ui.Button(");
      if ("style" in button) {
        lines.push(
          `        style=discord.ButtonStyle.${ButtonStyle[button.style].toLowerCase()}),`,
        );
      }
      if ("url" in button && button.url) {
        lines.push(`        url=${quoteString(button.url, preferences)},`);
      } else if ("custom_id" in button) {
        lines.push(
          `        custom_id=${quoteString(button.custom_id, preferences)},`,
        );
      } else if ("sku_id" in button) {
        lines.push(
          `        sku_id=${quoteString(button.sku_id, preferences)},`,
        );
      }
      if ("label" in button && button.label) {
        lines.push(`        label=${quoteString(button.label, preferences)},`);
      }
      if ("disabled" in button && button.disabled) {
        lines.push("        disabled=True,");
      }
      if ("emoji" in button && button.emoji) {
        const emoji = button.emoji.id
          ? `discord.PartialEmoji.from_str(${quoteString(
              `${
                button.emoji.animated ? "a:" : ""
              }${button.emoji.name}:${button.emoji.id}`,
              preferences,
            )})`
          : // biome-ignore lint/style/noNonNullAssertion: required if no ID (unicode)
            quoteString(button.emoji.name!, preferences);
        lines.push(`        emoji=${emoji},`);
        if (button.id) {
          lines.push(`        id=${button.id},`);
        }
      }
      lines.push("    )");
    } else if (component.accessory.type === ComponentType.Thumbnail) {
      const thumbnail = component.accessory as APIThumbnailComponent;
      lines.push(
        "    accessory=ui.Thumbnail(",
        `        ${quoteString(thumbnail.media.url, preferences)},`,
      );
      if (thumbnail.description) {
        lines.push(
          `        description=${quoteString(thumbnail.description, preferences)},`,
        );
      }
      if (thumbnail.spoiler) {
        lines.push("        spoiler=True,");
      }
      if (thumbnail.id) {
        lines.push(`        id=${thumbnail.id},`);
      }
      lines.push("    )");
    }
  }

  if (component.id) {
    lines.push(`    id=${component.id},`);
  }
  lines.push(")");
  return lines;
};

const generateContainerCode = (
  component: APIContainerComponent,
  preferences: CodeGeneratorPreferences,
): string[] => {
  const lines = ["ui.Container("];

  for (const child of component.components ?? []) {
    const generated = singleComponentDeclaration(child, preferences);
    if (generated.length === 0) continue;
    generated[generated.length - 1] += ",";
    lines.push(...indentList(generated, 4));
  }

  if (component.accent_color) {
    const colorKw = preferences.colorSpelling ?? "color";
    lines.push(`    accent_${colorKw}=${component.accent_color},`);
  }
  if (component.spoiler) {
    lines.push("    spoiler=True,");
  }
  if (component.id) {
    lines.push(`    id=${component.id},`);
  }
  lines.push(")");
  return lines;
};

const singleComponentDeclaration = (
  component: APIMessageComponent,
  preferences: CodeGeneratorPreferences,
) => {
  switch (component.type) {
    case ComponentType.TextDisplay:
      return generateTextDisplayCode(component, preferences);
    case ComponentType.Section:
      return generateSectionCode(component, preferences);
    case ComponentType.Container:
      return generateContainerCode(component, preferences);
    case ComponentType.Separator:
      return generateSeparatorCode(component, preferences);
    case ComponentType.File:
      return generateFileCode(component, preferences);
    case ComponentType.MediaGallery:
      return generateMediaGalleryCode(component, preferences);
    default:
      return [];
  }
};

export const codegen: CodeGeneratorFn = (data, preferences) => {
  const imports = ["import discord"];
  const lines: string[] = [];

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
      imports.push("from discord import ui");
      if (data.components.length === 1) {
        const componentLines = singleComponentDeclaration(
          data.components[0],
          preferences,
        );
        componentLines[0] = `component = ${componentLines[0]}`;
        lines.push(...componentLines);
      } else {
        lines.push("components = [");
        for (const component of data.components) {
          const componentLines = singleComponentDeclaration(
            component,
            preferences,
          );
          componentLines[componentLines.length - 1] += ",";
          lines.push(...indentList(componentLines, 4));
        }
        lines.push("]");
      }
    }
  }

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
      kwargs.push(`description=${quoteString(embed.description, preferences)}`);
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
          `        inline=${pybool(inline)},`,
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
};
export default codegen;

import {
  type APIActionRowComponent,
  type APIComponentInContainer,
  type APIComponentInModalActionRow,
  type APIContainerComponent,
  type APIMessageComponent,
  ButtonStyle,
  ComponentType,
  MessageFlags,
} from "discord-api-types/v10";
import { MessageFlagsBitField } from "discord-bitflag";
import type { TFunction } from "i18next";
import { twJoin, twMerge } from "tailwind-merge";
import type { DraftFile } from "~/routes/_index";
import {
  APIComponentInMessageActionRow,
  APIMessageTopLevelComponent,
  QueryData,
} from "~/types/QueryData";
import {
  MAX_CONTAINER_COMPONENTS,
  MAX_TOP_LEVEL_COMPONENTS,
  MAX_TOTAL_COMPONENTS,
} from "~/util/constants";
import { isActionRow } from "~/util/discord";
import { transformFileName } from "~/util/files";
import { InfoBox } from "../InfoBox";
import { CoolIcon } from "../icons/CoolIcon";

/** Also strips query and fragment */
const stripProtocol = (uri: string) => {
  try {
    const url = new URL(uri);
    return `${url.host}${url.pathname}`;
  } catch {
    return uri;
  }
};

/** Attempt to find an appropriate preview string for a given message component */
export const getComponentText = (
  component: APIMessageComponent,
): string | undefined => {
  switch (component.type) {
    case ComponentType.Button:
      return component.style !== ButtonStyle.Premium
        ? component.label ?? component.emoji?.name
        : `SKU ${component.sku_id}`;
    case ComponentType.StringSelect:
    case ComponentType.RoleSelect:
    case ComponentType.UserSelect:
    case ComponentType.ChannelSelect:
    case ComponentType.MentionableSelect:
      return component.placeholder;
    case ComponentType.Section:
      return component.components.find((c) => !!c.content)?.content;
    case ComponentType.TextDisplay:
      return component.content;
    case ComponentType.MediaGallery:
      return component.items[0]
        ? component.items[0].description ??
            stripProtocol(component.items[0].media.url)
        : undefined;
    case ComponentType.File:
      return stripProtocol(component.file.url);
    case ComponentType.Container: {
      const withText = component.components.map((c) => {
        // @ts-expect-error Impossible per types but we're avoiding a loop
        // that could be possible if forced somehow
        if (c.type === ComponentType.Container) return;
        return getComponentText(c);
      });
      return withText[0];
    }
    default:
      return;
  }
};

export const getComponentWidth = (component: {
  type: ComponentType;
}): number => {
  switch (component.type) {
    case ComponentType.Button:
      return 1;
    case ComponentType.StringSelect:
    case ComponentType.UserSelect:
    case ComponentType.RoleSelect:
    case ComponentType.MentionableSelect:
    case ComponentType.ChannelSelect:
    case ComponentType.TextInput:
      return 5;
    default:
      break;
  }
  return 0;
};

export const getRowWidth = (
  row: APIActionRowComponent<
    APIComponentInMessageActionRow | APIComponentInModalActionRow
  >,
): number => {
  return row.components.reduce(
    (last, component) => getComponentWidth(component) + last,
    0,
  );
};

export const getComponentErrors = (
  component: APIMessageComponent,
  files?: DraftFile[],
): string[] => {
  const errors: string[] = [];
  switch (component.type) {
    case ComponentType.ActionRow:
      if (component.components.length === 0) {
        errors.push("rowEmpty");
      }
      // if (component.components.length > 5) {
      //   errors.push("Cannot contain more than five components")
      // }
      break;
    case ComponentType.Button:
      if (
        component.style !== ButtonStyle.Premium &&
        !component.emoji &&
        !component.label
      ) {
        errors.push("labelEmpty");
      }
      if (component.style === ButtonStyle.Link && !component.url) {
        errors.push("urlEmpty");
      }
      break;
    case ComponentType.StringSelect:
      if (component.options.length === 0) {
        errors.push("optionsEmpty");
      }
      break;
    case ComponentType.File:
      if (files && component.file.url) {
        const file = files.find(
          (f) =>
            `attachment://${transformFileName(f.file.name)}` ===
            component.file.url,
        );
        if (!file) {
          errors.push("fileMissing");
        }
      }
      break;
    default:
      break;
  }
  return errors;
};

export interface TopLevelComponentEditorContainerProps {
  t: TFunction;
  message: QueryData["messages"][number];
  component: APIMessageTopLevelComponent;
  parent: APIContainerComponent | undefined;
  index: number;
  data: QueryData;
  setData: React.Dispatch<QueryData>;
  open?: boolean;
  files?: DraftFile[];
}

export const TopLevelComponentEditorContainer = ({
  t,
  message,
  component,
  parent,
  index: i,
  data,
  setData,
  open,
  children,
  files,
}: React.PropsWithChildren<TopLevelComponentEditorContainerProps>) => {
  const errors = getComponentErrors(component, files);

  return (
    <details
      className="group/top-1 rounded-lg p-2 pl-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow"
      open={open}
    >
      <TopLevelComponentEditorContainerSummary
        t={t}
        component={component}
        message={message}
        parent={parent}
        index={i}
        data={data}
        setData={setData}
        groupNestLevel={1}
      />
      {errors.length > 0 && (
        <div className="-mt-1 mb-1">
          <InfoBox severity="red" icon="Circle_Warning">
            {errors.map((k) => t(k)).join("\n")}
          </InfoBox>
        </div>
      )}
      {children}
    </details>
  );
};

export const TopLevelComponentEditorContainerSummary = ({
  t,
  component,
  index: i,
  message,
  parent,
  data,
  setData,
  className,
  groupNestLevel = 1,
}: {
  t: TFunction<"translation", undefined>;
  message: QueryData["messages"][number];
  component: APIMessageTopLevelComponent;
  parent: APIContainerComponent | undefined;
  index: number;
  setData: React.Dispatch<QueryData>;
  data: QueryData;
  className?: string;
  // This exists because:
  // - Nested groups must be named to work like we want
  // - Tailwind utility names cannot be "dynamically" generated
  // Our solution is to create two (for now) arbitrary "levels" to use when
  // rendering this component.
  groupNestLevel?: 1 | 2;
}) => {
  const previewText = getComponentText(component);

  const siblings: APIMessageTopLevelComponent[] | APIComponentInContainer[] =
    (parent ?? message.data).components ?? [];
  const MAX_SIBLINGS = new MessageFlagsBitField(message.data.flags ?? 0).has(
    MessageFlags.IsComponentsV2,
  )
    ? parent
      ? Math.min(
          // Remaining for the message
          MAX_TOTAL_COMPONENTS - MAX_CONTAINER_COMPONENTS,
          // No higher than the max for the parent type
          MAX_CONTAINER_COMPONENTS,
        )
      : MAX_TOP_LEVEL_COMPONENTS
    : 4;

  // Count up by type rather than just indicate position in the array
  const num =
    siblings.filter((c) => c.type === component.type).indexOf(component) + 1;

  return (
    <summary
      className={twMerge(
        groupNestLevel === 1
          ? "group-open/top-1:mb-2"
          : "group-open/top-2:mb-2",
        "transition-[margin] marker:content-none marker-none flex text-lg text-gray-600 dark:text-gray-400 font-semibold cursor-default select-none",
        className,
      )}
    >
      <CoolIcon
        icon="Chevron_Right"
        className={twJoin(
          groupNestLevel === 1
            ? "group-open/top-1:rotate-90"
            : "group-open/top-2:rotate-90",
          "ltr:mr-2 rtl:ml-2 my-auto transition-transform",
        )}
      />
      <p className="truncate">
        {t(`componentN.${component.type}${previewText ? "_text" : ""}`, {
          replace: { n: num, text: previewText },
        })}
      </p>
      <div className="ltr:ml-auto rtl:mr-auto text-xl space-x-2.5 rtl:space-x-reverse my-auto shrink-0">
        <button
          type="button"
          className={i === 0 ? "hidden" : ""}
          onClick={() => {
            siblings.splice(i, 1);
            siblings.splice(i - 1, 0, component);
            setData({ ...data });
          }}
        >
          <CoolIcon icon="Chevron_Up" />
        </button>
        <button
          type="button"
          className={i === siblings.length - 1 ? "hidden" : ""}
          onClick={() => {
            siblings.splice(i, 1);
            siblings.splice(i + 1, 0, component);
            setData({ ...data });
          }}
        >
          <CoolIcon icon="Chevron_Down" />
        </button>
        <button
          type="button"
          className={siblings.length >= MAX_SIBLINGS ? "hidden" : ""}
          onClick={() => {
            const cloned = structuredClone(component);
            if (isActionRow(cloned)) {
              for (const child of cloned.components) {
                child.custom_id = "";
              }
            }
            siblings.splice(i + 1, 0, cloned);
            setData({ ...data });
          }}
        >
          <CoolIcon icon="Copy" />
        </button>
        <button
          type="button"
          onClick={() => {
            siblings.splice(i, 1);
            setData({ ...data });
          }}
        >
          <CoolIcon icon="Trash_Full" />
        </button>
      </div>
    </summary>
  );
};

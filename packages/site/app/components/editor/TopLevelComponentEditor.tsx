import { Collapsible } from "@base-ui/react/collapsible";
import {
  ButtonStyle,
  ComponentType,
  type APIComponentInContainer,
  type APIContainerComponent,
  type APIMessageComponent,
} from "discord-api-types/v10";
import { twJoin, twMerge } from "tailwind-merge";
import type { DraftFile } from "~/routes/_index";
import type { TFunction } from "~/types/i18next";
import type { APIMessageTopLevelComponent, QueryData } from "~/types/QueryData";
import type { ComponentPath } from "~/util/componentTree";
import {
  isTopLevelDropValid,
  moveTopLevelComponentByPath,
} from "~/util/componentTree";
import { MAX_TOTAL_COMPONENTS, MAX_V1_ROWS } from "~/util/constants";
import { isComponentsV2 } from "~/util/discord";
import { DragType, type DragManager } from "~/util/drag";
import { randomString } from "~/util/text";
import { usePointerDragSource } from "~/util/usePointerDrag";
import { collapsibleStyles } from "../collapsible";
import { CoolIcon } from "../icons/CoolIcon";
import { InfoBox } from "../InfoBox";
import { resolveAttachmentUri } from "../preview/Embed";

export { getComponentWidth, getRowWidth } from "~/util/componentTree";

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
        ? (component.label ?? component.emoji?.name)
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
        ? (component.items[0].description ??
            stripProtocol(component.items[0].media.url))
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
        const file = resolveAttachmentUri(component.file.url, files, true);
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
  path: ComponentPath;
  data: QueryData;
  setData: React.Dispatch<QueryData>;
  open?: boolean;
  files?: DraftFile[];
  drag?: DragManager;
}

export const TopLevelComponentEditorContainer = ({
  t,
  message,
  component,
  parent,
  index: i,
  path,
  data,
  setData,
  open,
  children,
  files,
  drag,
}: React.PropsWithChildren<TopLevelComponentEditorContainerProps>) => {
  const errors = getComponentErrors(component, files);
  return (
    <Collapsible.Root
      className={twJoin(
        "group/top-1 rounded-lg p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow",
      )}
      defaultOpen={open}
    >
      <TopLevelComponentEditorContainerSummary
        t={t}
        component={component}
        message={message}
        parent={parent}
        index={i}
        path={path}
        data={data}
        setData={setData}
        errors={errors}
        drag={drag}
        groupNestLevel={1}
      />
      <Collapsible.Panel className={collapsibleStyles.editorPanel}>
        {errors.length > 0 && (
          <InfoBox severity="red" icon="Circle_Warning">
            {errors.map((k) => t(k)).join("\n")}
          </InfoBox>
        )}
        {children}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};

export const TopLevelComponentEditorContainerSummary = ({
  t,
  component,
  index: i,
  path,
  message,
  parent,
  data,
  setData,
  className,
  triggerClassName,
  errors,
  drag,
  groupNestLevel = 1,
  actionsBar,
}: {
  t: TFunction;
  message: QueryData["messages"][number];
  component: APIMessageTopLevelComponent;
  parent: APIContainerComponent | undefined;
  index: number;
  path: ComponentPath;
  setData: React.Dispatch<QueryData>;
  data: QueryData;
  className?: string;
  triggerClassName?: string;
  errors?: string[];
  drag?: DragManager;
  // This exists because:
  // - Nested groups must be named to work like we want
  // - Tailwind utility names cannot be "dynamically" generated
  // Our solution is to create two (for now) arbitrary "levels" to use when
  // rendering this component.
  groupNestLevel?: 1 | 2;
  actionsBar?: Partial<
    Record<"up" | "down" | "copy" | "delete", (() => void) | null>
  >;
}) => {
  // const mid = getQdMessageId(message);
  const previewText = getComponentText(component);

  const { onPointerDown, dragging } = usePointerDragSource(
    drag,
    DragType.TopLevelComponent,
    () => ({
      data: {
        type: component.type,
        path,
        label: previewText ?? t(`component.${component.type}`),
      },
      onDrop(messageId, args) {
        const msg = data.messages.find((m) => m._id === messageId);
        if (!msg) {
          console.error(
            "Drop callback referenced unknown message ID",
            messageId,
          );
          return;
        }
        msg.data.components = msg.data.components ?? [];
        const opts = args as { path: ComponentPath };
        const destParentType =
          opts.path.length === 2 ? ComponentType.Container : undefined;
        if (!isTopLevelDropValid(component.type, destParentType)) return;
        moveTopLevelComponentByPath(msg.data.components, path, opts.path);
        setData({ ...data });
      },
    }),
  );

  const allComponentsCount =
    message.data.components
      ?.map((c) => 1 + ("components" in c ? c.components.length : 0))
      .reduce((a, b) => a + b, 0) ?? 0;

  const siblings: APIMessageTopLevelComponent[] | APIComponentInContainer[] =
    (parent ?? message.data).components ?? [];
  // Count up by type rather than just indicate position in the array
  const num =
    siblings.filter((c) => c.type === component.type).indexOf(component) + 1;

  return (
    <div
      className={twMerge(
        "flex items-center text-gray-600 dark:text-gray-400",
        className,
      )}
    >
      {drag ? (
        <div
          className={twJoin(
            "touch-none shrink-0 text-lg flex items-center",
            // Make the handle always at the same x pos
            groupNestLevel === 2 ? "ps-3" : "ps-2",
            dragging ? "cursor-grabbing" : "cursor-grab",
          )}
          onPointerDown={onPointerDown}
        >
          <CoolIcon icon="Drag_Vertical" />
        </div>
      ) : null}
      <Collapsible.Trigger
        className={twJoin(
          "truncate flex items-center text-lg grow font-semibold cursor-default select-none",
          groupNestLevel === 1 ? "group/trigger-1" : "group/trigger-2",
          triggerClassName,
        )}
      >
        <CoolIcon
          icon="Chevron_Right"
          className={twJoin(
            groupNestLevel === 1
              ? "group-data-[panel-open]/trigger-1:rotate-90"
              : "group-data-[panel-open]/trigger-2:rotate-90",
            "me-2 transition-transform",
          )}
        />
        {errors && errors.length > 0 ? (
          <CoolIcon
            icon="Circle_Warning"
            className="text-rose-600 dark:text-rose-400 me-1.5"
          />
        ) : null}
        <p className="truncate">
          {t(`componentN.${component.type}${previewText ? "_text" : ""}`, {
            replace: { n: num, text: previewText },
          })}
        </p>
      </Collapsible.Trigger>
      <div className="ms-auto text-xl space-x-2.5 rtl:space-x-reverse shrink-0">
        <button
          type="button"
          className={i === 0 || actionsBar?.up === null ? "hidden" : ""}
          onClick={
            actionsBar?.up ??
            (() => {
              siblings.splice(i, 1);
              siblings.splice(i - 1, 0, component);
              setData({ ...data });
            })
          }
        >
          <CoolIcon icon="Chevron_Up" />
        </button>
        <button
          type="button"
          className={
            i === siblings.length - 1 || actionsBar?.down === null
              ? "hidden"
              : ""
          }
          onClick={
            actionsBar?.down ??
            (() => {
              siblings.splice(i, 1);
              siblings.splice(i + 1, 0, component);
              setData({ ...data });
            })
          }
        >
          <CoolIcon icon="Chevron_Down" />
        </button>
        <button
          type="button"
          className={
            (isComponentsV2(message.data)
              ? allComponentsCount >= MAX_TOTAL_COMPONENTS
              : siblings.length >= MAX_V1_ROWS) || actionsBar?.copy === null
              ? "hidden"
              : ""
          }
          onClick={
            actionsBar?.copy ??
            (() => {
              const cloned = structuredClone(component);
              cloned._key = randomString(10);
              // strip all custom IDs, which must be unique per message
              if ("components" in cloned) {
                for (const child of cloned.components) {
                  child._key = randomString(10);
                  if ("components" in child) {
                    for (const childChild of child.components) {
                      childChild._key = randomString(10);
                      if ("custom_id" in childChild) {
                        childChild.custom_id = "";
                      }
                    }
                  } else if ("custom_id" in child) {
                    child.custom_id = "";
                  }
                }
              }

              siblings.splice(i + 1, 0, cloned);
              setData({ ...data });
            })
          }
        >
          <CoolIcon icon="Copy" />
        </button>
        <button
          type="button"
          className={actionsBar?.delete === null ? "hidden" : ""}
          onClick={
            actionsBar?.delete ??
            (() => {
              siblings.splice(i, 1);
              setData({ ...data });
            })
          }
        >
          <CoolIcon icon="Trash_Full" />
        </button>
      </div>
    </div>
  );
};

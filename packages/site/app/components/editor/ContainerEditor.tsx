import {
  type APIContainerComponent,
  ComponentType,
} from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import type { EditingComponentData } from "~/modals/ComponentEditModal";
import { type DraftFile, getQdMessageId } from "~/routes/_index";
import type { APIMessageTopLevelComponent, QueryData } from "~/types/QueryData";
import type { CacheManager } from "~/util/cache/CacheManager";
import { MAX_TOTAL_COMPONENTS } from "~/util/constants";
import { ButtonSelect } from "../ButtonSelect";
import { Checkbox } from "../Checkbox";
import { InfoBox } from "../InfoBox";
import { ColorPickerPopoverWithTrigger } from "../pickers/ColorPickerPopover";
import { decimalToHex } from "./ColorPicker";
import { ActionRowEditor } from "./ComponentEditor";
import { FileEditor } from "./FileEditor";
import { MediaGalleryEditor } from "./MediaGalleryEditor";
import { SectionEditor } from "./SectionEditor";
import { SeparatorEditor } from "./SeparatorEditor";
import { TextDisplayEditor } from "./TextDisplayEditor";
import {
  getComponentErrors,
  type TopLevelComponentEditorContainerProps,
  TopLevelComponentEditorContainerSummary,
} from "./TopLevelComponentEditor";

export const AutoTopLevelComponentEditor = (
  props: Omit<TopLevelComponentEditorContainerProps, "t"> & {
    component: APIMessageTopLevelComponent;
    setEditingComponent: React.Dispatch<
      React.SetStateAction<EditingComponentData | undefined>
    >;
    files: DraftFile[];
    setFiles: React.Dispatch<React.SetStateAction<DraftFile[]>>;
    cache: CacheManager | undefined;
    cdn?: string;
  },
) => {
  const { component, setEditingComponent, files, setFiles, cdn, ...rest } =
    props;
  switch (component.type) {
    case ComponentType.ActionRow:
      return (
        <ActionRowEditor
          {...rest}
          component={component}
          setEditingComponent={setEditingComponent}
        />
      );
    case ComponentType.Container:
      return (
        <ContainerEditor
          // all props; containers render AutoTopLevelComponentEditor as child
          {...props}
          component={component}
        />
      );
    case ComponentType.Section:
      return (
        <SectionEditor
          {...rest}
          component={component}
          setEditingComponent={setEditingComponent}
          files={files}
          setFiles={setFiles}
          cdn={cdn}
        />
      );
    case ComponentType.TextDisplay:
      return <TextDisplayEditor {...rest} component={component} />;
    case ComponentType.MediaGallery:
      return (
        <MediaGalleryEditor
          {...rest}
          component={component}
          files={files}
          setFiles={setFiles}
          cdn={cdn}
        />
      );
    case ComponentType.Separator:
      return <SeparatorEditor {...rest} component={component} />;
    case ComponentType.File:
      return (
        <FileEditor
          {...rest}
          component={component}
          files={files}
          setFiles={setFiles}
        />
      );
    default:
      // always return an Element for type consistency
      return <></>;
  }
};

export const ContainerEditor: React.FC<{
  message: QueryData["messages"][number];
  component: APIContainerComponent;
  parent: APIContainerComponent | undefined;
  index: number;
  data: QueryData;
  setData: React.Dispatch<QueryData>;
  cache: CacheManager | undefined;
  cdn?: string;
  open?: boolean;
  setEditingComponent: React.Dispatch<
    React.SetStateAction<EditingComponentData | undefined>
  >;
  files: DraftFile[];
  setFiles: React.Dispatch<React.SetStateAction<DraftFile[]>>;
}> = (props) => {
  const {
    message,
    component: container,
    parent,
    index: i,
    data,
    setData,
    open,
  } = props;

  const { t } = useTranslation();
  const mid = getQdMessageId(message);
  const errors = getComponentErrors(container);

  const allComponentsCount =
    message.data.components
      ?.map((c) => 1 + ("components" in c ? c.components.length : 0))
      .reduce((a, b) => a + b, 0) ?? 0;

  return (
    <details
      className={twJoin(
        "group/top-2 rounded-lg p-2 border border-gray-300 dark:border-gray-700 shadow transition-[border-color,border-width]",
        container.accent_color != null ? "border-l-4" : undefined,
      )}
      style={
        container.accent_color != null
          ? { borderLeftColor: decimalToHex(container.accent_color) }
          : undefined
      }
      open={open}
    >
      <TopLevelComponentEditorContainerSummary
        t={t}
        component={container}
        message={message}
        parent={parent}
        index={i}
        data={data}
        setData={setData}
        className={
          "rounded-lg group-open/top-2:rounded-b-none -m-2 group-open/top-2:mb-2 p-2 pl-4 bg-gray-100 dark:bg-gray-800 group-open/top-2:border-b border-gray-300 dark:border-gray-700 transition-all"
        }
        groupNestLevel={2}
      />
      {errors.length > 0 && (
        <div className="-mt-1 mb-1">
          <InfoBox severity="red" icon="Circle_Warning">
            {errors.map((k) => t(k)).join("\n")}
          </InfoBox>
        </div>
      )}
      <div className="grid gap-2 mt-2 pl-2">
        <div>
          <Checkbox
            label={t("markSpoiler")}
            checked={container.spoiler ?? false}
            onCheckedChange={(checked) => {
              container.spoiler = checked;
              setData({ ...data });
            }}
          />
        </div>
        <ColorPickerPopoverWithTrigger
          t={t}
          value={container.accent_color}
          onValueChange={(color) => {
            container.accent_color = color ?? null;
            setData({ ...data });
          }}
        />
      </div>
      <div className="mt-2 space-y-2">
        {container.components.map((child, ci) => (
          <AutoTopLevelComponentEditor
            key={`message-${mid}-container-${i}-child-${ci}`}
            {...props}
            parent={container}
            index={ci}
            component={child}
          />
        ))}
        <div className="flex ltr:ml-2 rtl:mr-2">
          <div>
            <ButtonSelect
              disabled={allComponentsCount >= MAX_TOTAL_COMPONENTS}
              options={[
                {
                  label: t("content"),
                  icon: "Text",
                  value: ComponentType.TextDisplay,
                },
                {
                  label: t("component.12"),
                  icon: "Image_01",
                  value: ComponentType.MediaGallery,
                },
                {
                  // Any single file
                  label: t("file"),
                  icon: "File_Blank",
                  value: ComponentType.File,
                },
                {
                  label: t("component.14"),
                  icon: "Line_L",
                  value: ComponentType.Separator,
                },
                {
                  label: t("component.1"),
                  icon: "Rows",
                  value: ComponentType.ActionRow,
                },
              ]}
              onValueChange={(value) => {
                switch (value) {
                  case ComponentType.TextDisplay: {
                    container.components.push({
                      type: ComponentType.TextDisplay,
                      content: "",
                    });
                    setData({ ...data });
                    break;
                  }
                  case ComponentType.File: {
                    container.components.push({
                      type: ComponentType.File,
                      file: { url: "" },
                    });
                    setData({ ...data });
                    break;
                  }
                  case ComponentType.MediaGallery: {
                    container.components.push({
                      type: ComponentType.MediaGallery,
                      items: [],
                    });
                    setData({ ...data });
                    break;
                  }
                  case ComponentType.Separator: {
                    container.components.push({
                      type: ComponentType.Separator,
                    });
                    setData({ ...data });
                    break;
                  }
                  case ComponentType.ActionRow: {
                    container.components.push({
                      type: ComponentType.ActionRow,
                      components: [],
                    });
                    setData({ ...data });
                    break;
                  }
                  default:
                    break;
                }
              }}
            >
              {t("add")}
            </ButtonSelect>
          </div>
        </div>
      </div>
    </details>
  );
};

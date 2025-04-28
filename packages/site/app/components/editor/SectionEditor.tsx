import {
  APIContainerComponent,
  APISectionComponent,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import type { EditingComponentData } from "~/modals/ComponentEditModal";
import { type DraftFile, getQdMessageId } from "~/routes/_index";
import { APIButtonComponent, QueryData } from "~/types/QueryData";
import { CacheManager } from "~/util/cache/CacheManager";
import { MAX_TOTAL_COMPONENTS_CHARACTERS } from "~/util/constants";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { useError } from "../Error";
import { FileOrUrlInput } from "../FileOrUrlInput";
import { TextArea } from "../TextArea";
import { TextInput } from "../TextInput";
import { CoolIcon } from "../icons/CoolIcon";
import {
  IndividualComponentEditor,
  getSetEditingComponentProps,
} from "./ComponentEditor";
import { TopLevelComponentEditorContainer } from "./TopLevelComponentEditor";

export const SectionEditor: React.FC<{
  message: QueryData["messages"][number];
  component: APISectionComponent;
  parent: APIContainerComponent | undefined;
  index: number;
  data: QueryData;
  setData: React.Dispatch<QueryData>;
  cache?: CacheManager;
  open?: boolean;
  setEditingComponent: React.Dispatch<
    React.SetStateAction<EditingComponentData | undefined>
  >;
  files: DraftFile[];
  setFiles: React.Dispatch<React.SetStateAction<DraftFile[]>>;
}> = ({
  message,
  component: section,
  parent,
  index: i,
  data,
  setData,
  cache,
  open,
  setEditingComponent,
  files,
  setFiles,
}) => {
  const { t } = useTranslation();
  const mid = getQdMessageId(message);
  const [error, setError] = useError(t);

  const { accessory } = section;
  const removeAccessory = () => {
    const siblings = (parent ?? message.data).components;
    if (!siblings) {
      console.log("Could not resolve sibling container to splice into");
      return;
    }
    siblings.splice(i, 1, {
      id: section.id,
      type: ComponentType.TextDisplay,
      content: section.components.map((t) => t.content).join("\n"),
    });
    setData({ ...data });
  };

  return (
    <TopLevelComponentEditorContainer
      t={t}
      message={message}
      component={section}
      parent={parent}
      index={i}
      data={data}
      setData={setData}
      open={open}
    >
      {error}
      <div className="space-y-2">
        {section.components.map((component, ci) => {
          if (component.type !== ComponentType.TextDisplay) return null;

          return (
            <div className="flex gap-2">
              <div className="grow">
                <TextArea
                  label={t("content")}
                  className="w-full"
                  key={`${component.type}-${component.id ?? ci}`}
                  maxLength={MAX_TOTAL_COMPONENTS_CHARACTERS}
                  required
                  value={component.content}
                  markdown="full"
                  cache={cache}
                  onChange={({ currentTarget }) => {
                    component.content = currentTarget.value;
                    setData({ ...data });
                  }}
                />
              </div>
              <div className="flex flex-col mt-4 text-lg">
                <button
                  type="button"
                  className={twJoin(
                    "disabled:cursor-not-allowed disabled:text-muted disabled:dark:text-muted-dark",
                  )}
                  disabled={section.components.length <= 1}
                  title={t("delete")}
                  onClick={() => {
                    section.components = section.components.filter(
                      (_, i) => i !== ci,
                    );
                    setData({ ...data });
                  }}
                >
                  <CoolIcon icon="Trash_Full" className="leading-none" />
                </button>
                <button
                  type="button"
                  className={twJoin(
                    "disabled:cursor-not-allowed disabled:text-muted disabled:dark:text-muted-dark",
                  )}
                  disabled={section.components.length >= 3}
                  title={t("addText")}
                  onClick={() => {
                    section.components.splice(ci + 1, 0, {
                      type: ComponentType.TextDisplay,
                      content: "",
                    });
                    setData({ ...data });
                  }}
                >
                  <CoolIcon icon="Chat_Add" className="leading-none" />
                </button>
              </div>
            </div>
          );
        })}
        {section.components.length === 0 ? (
          <Button
            onClick={() => {
              section.components = [
                ...section.components,
                { type: ComponentType.TextDisplay, content: "" },
              ];
              setData({ ...data });
            }}
            discordstyle={ButtonStyle.Secondary}
          >
            <CoolIcon icon="Chat_Add" /> {t("addText")}
          </Button>
        ) : null}
        <div>
          <div className="flex">
            <p className="my-auto text-sm font-medium cursor-default truncate">
              {t("accessory")} –{" "}
              {t(
                accessory.type === ComponentType.Button &&
                  accessory.style === ButtonStyle.Link
                  ? "linkButton"
                  : `component.${accessory.type}`,
              )}
            </p>
            <button
              type="button"
              onClick={removeAccessory}
              className="ltr:ml-auto rtl:mr-auto my-auto text-base"
            >
              <CoolIcon icon="Trash_Full" />
            </button>
          </div>
          {accessory.type === ComponentType.Button ? (
            <div>
              <IndividualComponentEditor
                component={accessory}
                index={0}
                actionsBar={{ up: null, down: null, copy: null, delete: null }}
                row={{
                  type: ComponentType.ActionRow,
                  components: [accessory],
                }}
                updateRow={(row) => {
                  if (!row) return;

                  const component = row.components[0] as typeof accessory;
                  section.accessory = { ...component };
                  setData({ ...data });
                }}
                onClick={() => {
                  const button = accessory as APIButtonComponent;
                  if (
                    button.style !== ButtonStyle.Link &&
                    button.style !== ButtonStyle.Premium
                  ) {
                    button.flow = button.flow ?? { actions: [] };
                  }
                  setEditingComponent(
                    getSetEditingComponentProps({
                      component: button,
                      row: {
                        type: ComponentType.ActionRow,
                        components: [button],
                      },
                      componentIndex: 0,
                      data,
                      setData,
                      setEditingComponent,
                      setComponent(component) {
                        section.accessory = component as APIButtonComponent;
                        setData({ ...data });
                      },
                    }),
                  );
                }}
              />
            </div>
          ) : accessory.type === ComponentType.Thumbnail ? (
            <div className="space-y-1">
              <div className="w-full">
                <FileOrUrlInput
                  t={t}
                  value={accessory.media.url}
                  onChange={(value) => {
                    accessory.media = { url: value };
                    setData({ ...data });
                  }}
                  files={files}
                  setFiles={setFiles}
                  required
                />
              </div>
              {accessory.media.url ? (
                <>
                  <TextInput
                    label={t("description")}
                    className="w-full"
                    value={accessory.description ?? ""}
                    maxLength={1024}
                    onChange={({ currentTarget }) => {
                      accessory.description = currentTarget.value || null;
                      setData({ ...data });
                    }}
                  />
                  <Checkbox
                    label={t("markSpoiler")}
                    checked={accessory.spoiler ?? false}
                    onChange={({ currentTarget }) => {
                      accessory.spoiler = currentTarget.checked;
                      setData({ ...data });
                    }}
                  />
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </TopLevelComponentEditorContainer>
  );
};

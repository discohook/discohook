import {
  APISectionComponent,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import type { EditingComponentData } from "~/modals/ComponentEditModal";
import { type DraftFile, getQdMessageId } from "~/routes/_index";
import { APIButtonComponent, QueryData } from "~/types/QueryData";
import { CacheManager } from "~/util/cache/CacheManager";
import { MAX_TOTAL_COMPONENTS_CHARACTERS } from "~/util/constants";
import { Button } from "../Button";
import { useError } from "../Error";
import { TextArea } from "../TextArea";
import { CoolIcon } from "../icons/CoolIcon";
import {
  IndividualComponentEditor,
  getSetEditingComponentProps,
} from "./ComponentEditor";
import { TopLevelComponentEditorContainer } from "./TopLevelComponentEditor";

export const SectionEditor: React.FC<{
  message: QueryData["messages"][number];
  component: APISectionComponent;
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
  return (
    <TopLevelComponentEditorContainer
      t={t}
      message={message}
      component={section}
      index={i}
      data={data}
      setData={setData}
      open={open}
    >
      {error}
      <div className="space-y-2">
        <div className="">
          <p className="text-sm font-medium cursor-default">
            {t("accessory")}
            <span className="align-baseline text-rose-400">*</span>
          </p>
          {accessory.type === ComponentType.Button ? (
            <div>
              <IndividualComponentEditor
                component={accessory}
                index={0}
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
            <div>img</div>
          ) : null}
        </div>
        {section.components.map((component, ci) => {
          if (component.type !== ComponentType.TextDisplay) return null;

          return (
            <div>
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
              <div className="flex gap-2 mt-1 text-sm">
                <Button
                  onClick={() => {
                    section.components = section.components.filter(
                      (_, i) => i !== ci,
                    );
                    setData({ ...data });
                  }}
                  discordstyle={ButtonStyle.Secondary}
                >
                  <CoolIcon icon="Trash_Full" /> {t("delete")}
                </Button>
                {section.components.length < 3 &&
                ci === section.components.length - 1 ? (
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
      </div>
    </TopLevelComponentEditorContainer>
  );
};

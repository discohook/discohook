import {
  type APIActionRowComponent,
  type APIContainerComponent,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import type { z } from "zod/v3";
import type { ComponentFoundBackupHook } from "~/api/v1/components.$id.backups";
import { getComponentId } from "~/api/v1/log.webhooks.$webhookId.$webhookToken.messages.$messageId";
import type { EditingComponentData } from "~/modals/ComponentEditModal";
import { getQdMessageId } from "~/routes/_index";
import type { ZodAPIMessageActionRowComponent } from "~/types/components";
import type {
  APIComponentInMessageActionRow,
  QueryData,
} from "~/types/QueryData";
import type { CacheManager } from "~/util/cache/CacheManager";
import { MAX_ACTION_ROW_WIDTH } from "~/util/constants";
import type { DragManager } from "~/util/drag";
import { ButtonSelect } from "../ButtonSelect";
import { useError } from "../Error";
import { IndividualComponentEditor, submitComponent } from "./ComponentEditor";
import {
  getRowWidth,
  TopLevelComponentEditorContainer,
} from "./TopLevelComponentEditor";

export const getSetEditingComponentProps = ({
  component,
  row,
  componentIndex,
  data,
  setData,
  setEditingComponent,
  setComponent: setComponent_,
}: {
  component: APIComponentInMessageActionRow;
  row: APIActionRowComponent<APIComponentInMessageActionRow>;
  componentIndex: number;
  data: QueryData;
  setData: React.Dispatch<QueryData>;
  setEditingComponent: React.Dispatch<
    React.SetStateAction<EditingComponentData | undefined>
  >;
  setComponent?: EditingComponentData["setComponent"];
}): EditingComponentData => {
  // Allow a custom value so this works without a row
  const setComponent =
    setComponent_ ??
    ((updated) => {
      row.components.splice(componentIndex, 1, updated);
      setData({ ...data });
    });

  return {
    component,
    setComponent,
    submit: async (newComponent, setError) => {
      const withId = { ...newComponent };
      if (
        withId.custom_id &&
        withId.type === ComponentType.Button &&
        withId.style === ButtonStyle.Link
      ) {
        try {
          const url = new URL(withId.url);
          if (url.searchParams.get("dhc-id")) {
            url.searchParams.delete("dhc-id");
          }
          withId.url = url.href;
        } catch {}
      }

      const updated = await submitComponent(withId, setError);
      if (updated) {
        setComponent(updated);

        // Reset state with new component so that subsequent saves
        // without closing the modal will PUT instead of POSTing
        setEditingComponent(
          getSetEditingComponentProps({
            component: updated,
            row,
            componentIndex,
            data,
            setData,
            setEditingComponent,
          }),
        );
        return updated;
      }
      throw Error("Component could not be updated");
    },
  };
};

export const ActionRowEditor: React.FC<{
  message: QueryData["messages"][number];
  component: APIActionRowComponent<APIComponentInMessageActionRow>;
  parent: APIContainerComponent | undefined;
  index: number;
  data: QueryData;
  setData: React.Dispatch<QueryData>;
  setEditingComponent: React.Dispatch<
    React.SetStateAction<EditingComponentData | undefined>
  >;
  componentFoundBackupsHook: ComponentFoundBackupHook;
  drag?: DragManager;
  cache?: CacheManager;
  open?: boolean;
}> = ({
  message,
  component: row,
  parent,
  index: i,
  data,
  setData,
  setEditingComponent,
  componentFoundBackupsHook,
  drag,
  // cache,
  open,
}) => {
  const { t } = useTranslation();
  const mid = getQdMessageId(message);
  const [error, setError] = useError(t);

  return (
    <TopLevelComponentEditorContainer
      t={t}
      message={message}
      component={row}
      parent={parent}
      index={i}
      data={data}
      setData={setData}
      drag={drag}
      open={open}
    >
      {error}
      <div className="space-y-1">
        {row.components.map((component, ci) => {
          const id = getComponentId(component)?.toString();
          return (
            <IndividualComponentEditor
              key={`edit-message-${mid}-component-${id}-${ci}`}
              component={component}
              index={ci}
              row={row}
              updateRow={() => setData({ ...data })}
              componentFoundBackupsHook={componentFoundBackupsHook}
              onClick={() => {
                if (
                  (component.type === ComponentType.Button &&
                    component.style !== ButtonStyle.Link &&
                    component.style !== ButtonStyle.Premium) ||
                  component.type === ComponentType.UserSelect ||
                  component.type === ComponentType.RoleSelect ||
                  component.type === ComponentType.MentionableSelect ||
                  component.type === ComponentType.ChannelSelect
                ) {
                  component.flow = component.flow ?? { actions: [] };
                } else if (component.type === ComponentType.StringSelect) {
                  component.flows = component.flows ?? {};
                }
                setEditingComponent(
                  getSetEditingComponentProps({
                    component,
                    row,
                    componentIndex: ci,
                    data,
                    setData,
                    setEditingComponent,
                  }),
                );
              }}
            />
          );
        })}
      </div>
      <ButtonSelect<ComponentType | "linkButton">
        name="component-type"
        options={[
          {
            label: t("component.2"),
            value: ComponentType.Button,
            disabled: getRowWidth(row) >= MAX_ACTION_ROW_WIDTH,
          },
          {
            label: t("linkButton"),
            value: "linkButton",
            disabled: getRowWidth(row) >= MAX_ACTION_ROW_WIDTH,
          },
          {
            label: t("component.3"),
            value: ComponentType.StringSelect,
            disabled: getRowWidth(row) > 0,
          },
          {
            label: t("component.5"),
            value: ComponentType.UserSelect,
            disabled: getRowWidth(row) > 0,
          },
          {
            label: t("component.6"),
            value: ComponentType.RoleSelect,
            disabled: getRowWidth(row) > 0,
          },
          {
            label: t("component.7"),
            value: ComponentType.MentionableSelect,
            disabled: getRowWidth(row) > 0,
          },
          {
            label: t("component.8"),
            value: ComponentType.ChannelSelect,
            disabled: getRowWidth(row) > 0,
          },
        ]}
        disabled={getRowWidth(row) >= MAX_ACTION_ROW_WIDTH}
        onValueChange={async (type) => {
          let submitData:
            | z.infer<typeof ZodAPIMessageActionRowComponent>
            | undefined;
          switch (type) {
            case "linkButton": {
              submitData = {
                type: ComponentType.Button,
                style: ButtonStyle.Link,
                url: "https://discohook.app",
              };
              break;
            }
            case ComponentType.Button: {
              submitData = {
                type,
                style: ButtonStyle.Primary,
                custom_id: "",
              };
              break;
            }
            case ComponentType.StringSelect: {
              submitData = {
                type,
                custom_id: "",
                options: [],
              };
              break;
            }
            case ComponentType.UserSelect:
            case ComponentType.RoleSelect:
            case ComponentType.MentionableSelect:
            case ComponentType.ChannelSelect: {
              submitData = {
                type,
                custom_id: "",
              };
              break;
            }
            default:
              break;
          }
          if (submitData) {
            const i =
              row.components.push({
                ...submitData,
                _state: "submitting",
              } as unknown as typeof submitData) - 1;
            setData({ ...data });

            const component = await submitComponent(submitData, setError);
            if (component) {
              // setError callback should reasonably handle else state
              row.components.splice(i, 1, component);
              // TODO: remove `_state` so user can edit unsaved component?
            }
            setData({ ...data });
          }
        }}
      >
        {t("addComponent")}
      </ButtonSelect>
    </TopLevelComponentEditorContainer>
  );
};

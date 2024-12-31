import { SerializeFrom } from "@remix-run/cloudflare";
import { isLinkButton } from "discord-api-types/utils/v10";
import {
  APIActionRowComponent,
  APIMessageComponent,
  APITextInputComponent,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { z } from "zod";
import { type ApiRoute, BRoutes, apiUrl } from "~/api/routing";
import { action as ApiPostComponents } from "~/api/v1/components";
import { getComponentId } from "~/api/v1/log.webhooks.$webhookId.$webhookToken.messages.$messageId";
import { EditingComponentData } from "~/modals/ComponentEditModal";
import { getQdMessageId } from "~/routes/_index";
import {
  APIAutoPopulatedSelectMenuComponent,
  APIButtonComponent,
  APIButtonComponentWithCustomId,
  APIChannelSelectComponent,
  APIMentionableSelectComponent,
  APIMessageActionRowComponent,
  APIRoleSelectComponent,
  APIStringSelectComponent,
  APIUserSelectComponent,
  QueryData,
} from "~/types/QueryData";
import { ZodAPIMessageActionRowComponent } from "~/types/components";
import { CacheManager } from "~/util/cache/CacheManager";
import { getZodErrorMessage } from "~/util/loader";
import { ButtonSelect } from "../ButtonSelect";
import { SetErrorFunction, useError } from "../Error";
import { InfoBox } from "../InfoBox";
import { CoolIcon, CoolIconsGlyph } from "../icons/CoolIcon";

export const getComponentText = (
  component: APIMessageComponent,
): string | undefined =>
  component.type === ComponentType.Button
    ? component.style !== ButtonStyle.Premium
      ? component.label ?? component.emoji?.name
      : `SKU ${component.sku_id}`
    : component.type === ComponentType.StringSelect
      ? component.placeholder
      : undefined;

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
    | APIButtonComponent
    | APIStringSelectComponent
    | APIUserSelectComponent
    | APIRoleSelectComponent
    | APIMentionableSelectComponent
    | APIChannelSelectComponent
    | APITextInputComponent
  >,
): number => {
  return row.components.reduce(
    (last, component) => getComponentWidth(component) + last,
    0,
  );
};

export const getComponentErrors = (
  component: APIMessageComponent,
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
    default:
      break;
  }
  return errors;
};

/**
 * This is a bit of a dance, we basically just want to generate a
 * server ID for these components so they can remain synced.
 * We use the returned data from the server just in case it wanted
 * to change something.
 * You can also do this while logged out.
 */
export const submitComponent = async (
  data: APIMessageActionRowComponent,
  setError?: SetErrorFunction,
) => {
  const id = getComponentId(data)?.toString();

  const perform = (method: string, route: ApiRoute) =>
    fetch(apiUrl(route), {
      method,
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

  let response = id
    ? await perform("PUT", BRoutes.component(id))
    : await perform("POST", BRoutes.components());
  if (
    id !== undefined &&
    (response.status === 404 || response.status === 403)
  ) {
    // We tried to PUT, but the component doesn't exist anymore or isn't owned
    // by the current account. Since the client already has the required data,
    // the least confusing thing to do is simply create the component again.
    response = await perform("POST", BRoutes.components());
  }
  if (!response.ok) {
    console.error(response.status, response.statusText);
    if (setError) {
      const data = await response.json();
      setError({ message: getZodErrorMessage(data) });
    }
    return;
  }
  const raw = (await response.json()) as SerializeFrom<
    typeof ApiPostComponents
  >;
  let component: APIMessageActionRowComponent | undefined;
  switch (raw.data.type) {
    case ComponentType.Button: {
      component = {
        ...raw.data,
        custom_id: `p_${raw.id}`,
      };
      if (
        component.style !== ButtonStyle.Link &&
        component.style !== ButtonStyle.Premium
      ) {
        component.flow = (data as APIButtonComponentWithCustomId).flow;
      }
      break;
    }
    case ComponentType.StringSelect: {
      const { minValues, maxValues, ...rest } = raw.data;
      component = {
        flows: (data as APIStringSelectComponent).flows,
        ...rest,
        custom_id: `p_${raw.id}`,
        min_values: minValues,
        max_values: maxValues,
      };
      break;
    }
    case ComponentType.UserSelect:
    case ComponentType.RoleSelect:
    case ComponentType.MentionableSelect:
    case ComponentType.ChannelSelect: {
      const { minValues, maxValues, defaultValues, ...rest } = raw.data;
      component = {
        flow: (data as APIAutoPopulatedSelectMenuComponent).flow,
        ...rest,
        custom_id: `p_${raw.id}`,
        min_values: minValues,
        max_values: maxValues,
        // @ts-expect-error
        default_values: defaultValues,
      };
      break;
    }
    default:
      break;
  }
  if (setError) setError(undefined);
  return component;
};

export const getSetEditingComponentProps = ({
  component,
  row,
  componentIndex,
  data,
  setData,
  setEditingComponent,
}: {
  component: APIMessageActionRowComponent;
  row: APIActionRowComponent<APIMessageActionRowComponent>;
  componentIndex: number;
  data: QueryData;
  setData: React.Dispatch<QueryData>;
  setEditingComponent: React.Dispatch<
    React.SetStateAction<EditingComponentData | undefined>
  >;
}): EditingComponentData => {
  return {
    component,
    setComponent: (newComponent) => {
      row.components.splice(componentIndex, 1, newComponent);
      setData({ ...data });
    },
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
        row.components.splice(componentIndex, 1, updated);
        setData({ ...data });

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
  row: APIActionRowComponent<APIMessageActionRowComponent>;
  rowIndex: number;
  data: QueryData;
  setData: React.Dispatch<QueryData>;
  setEditingComponent: React.Dispatch<
    React.SetStateAction<EditingComponentData | undefined>
  >;
  cache?: CacheManager;
  open?: boolean;
}> = ({
  message,
  row,
  rowIndex: i,
  data,
  setData,
  setEditingComponent,
  // cache,
  open,
}) => {
  const { t } = useTranslation();
  const mid = getQdMessageId(message);
  const errors = getComponentErrors(row);
  const [error, setError] = useError(t);

  return (
    <details
      className="group/action-row rounded p-2 pl-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow"
      open={open}
    >
      <summary className="group-open/action-row:mb-2 transition-[margin] marker:content-none marker-none flex text-lg text-gray-600 dark:text-gray-400 font-semibold cursor-default select-none">
        <CoolIcon
          icon="Chevron_Right"
          className="group-open/action-row:rotate-90 ltr:mr-2 rtl:ml-2 my-auto transition-transform"
        />
        Row {i + 1}
        <div className="ltr:ml-auto rtl:mr-auto text-xl space-x-2.5 rtl:space-x-reverse my-auto shrink-0">
          <button
            type="button"
            className={i === 0 ? "hidden" : ""}
            onClick={() => {
              message.data.components?.splice(i, 1);
              message.data.components?.splice(i - 1, 0, row);
              setData({ ...data });
            }}
          >
            <CoolIcon icon="Chevron_Up" />
          </button>
          <button
            type="button"
            className={
              !!message.data.components &&
              i === message.data.components.length - 1
                ? "hidden"
                : ""
            }
            onClick={() => {
              message.data.components?.splice(i, 1);
              message.data.components?.splice(i + 1, 0, row);
              setData({ ...data });
            }}
          >
            <CoolIcon icon="Chevron_Down" />
          </button>
          <button
            type="button"
            className={
              !!message.data.components &&
              message.data.components.length - 1 + 1 >= 5
                ? "hidden"
                : ""
            }
            onClick={() => {
              message.data.components?.splice(i + 1, 0, structuredClone(row));
              setData({ ...data });
            }}
          >
            <CoolIcon icon="Copy" />
          </button>
          <button
            type="button"
            onClick={() => {
              message.data.components?.splice(i, 1);
              setData({ ...data });
            }}
          >
            <CoolIcon icon="Trash_Full" />
          </button>
        </div>
      </summary>
      {errors.length > 0 && (
        <div className="-mt-1 mb-1">
          <InfoBox severity="red" icon="Circle_Warning">
            {errors.map((k) => t(k)).join("\n")}
          </InfoBox>
        </div>
      )}
      {error}
      <div className="space-y-1 mb-1">
        {row.components.map((component, ci) => {
          const id = getComponentId(component)?.toString();
          return (
            <IndividualComponentEditor
              key={`edit-message-${mid}-component-${id}-${ci}`}
              component={component}
              index={ci}
              row={row}
              updateRow={() => setData({ ...data })}
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
      <ButtonSelect
        name="component-type"
        options={[
          {
            label: t("component.2"),
            value: ComponentType.Button,
            isDisabled: getRowWidth(row) >= 5,
          },
          {
            label: t("linkButton"),
            value: "linkButton",
            isDisabled: getRowWidth(row) >= 5,
          },
          {
            label: t("component.3"),
            value: ComponentType.StringSelect,
            isDisabled: getRowWidth(row) > 0,
          },
          {
            label: t("component.5"),
            value: ComponentType.UserSelect,
            isDisabled: getRowWidth(row) > 0,
          },
          {
            label: t("component.6"),
            value: ComponentType.RoleSelect,
            isDisabled: getRowWidth(row) > 0,
          },
          {
            label: t("component.7"),
            value: ComponentType.MentionableSelect,
            isDisabled: getRowWidth(row) > 0,
          },
          {
            label: t("component.8"),
            value: ComponentType.ChannelSelect,
            isDisabled: getRowWidth(row) > 0,
          },
        ]}
        isDisabled={getRowWidth(row) >= 5}
        onChange={async (v) => {
          const { value: type } = v as { value: ComponentType | "linkButton" };
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
    </details>
  );
};

export const IndividualComponentEditor: React.FC<{
  component: APIMessageActionRowComponent;
  index: number;
  row: APIActionRowComponent<APIMessageActionRowComponent>;
  updateRow: () => void;
  onClick: () => void;
}> = ({ component, index, row, updateRow, onClick }) => {
  const { t } = useTranslation();
  const previewText = getComponentText(component);

  // Don't allow an index change while the component is submitting
  // to avoid accidentally overwriting something
  const anySubmitting =
    row.components.filter((c) => "_state" in c && c._state === "submitting")
      .length !== 0;

  return (
    <div className="flex text-base text-gray-600 dark:text-gray-400 rounded bg-blurple/10 hover:bg-blurple/15 border border-blurple/30 shadow hover:shadow-lg transition font-semibold select-none">
      <button
        type="button"
        className="flex p-2 h-full w-full my-auto truncate disabled:animate-pulse"
        onClick={onClick}
        disabled={"_state" in component && component._state === "submitting"}
      >
        <div className="ltr:mr-2 rtl:ml-2 my-auto w-6 h-6 shrink-0">
          {component.type === ComponentType.Button ? (
            <div
              className={twJoin(
                "rounded text-gray-50",
                isLinkButton(component)
                  ? "p-[5px_5px_4px_4px]"
                  : "w-full h-full",
                {
                  [ButtonStyle.Primary]: "bg-blurple",
                  [ButtonStyle.Premium]: "bg-blurple",
                  [ButtonStyle.Secondary]: "bg-[#6d6f78] dark:bg-[#4e5058]",
                  [ButtonStyle.Link]: "bg-[#6d6f78] dark:bg-[#4e5058]",
                  [ButtonStyle.Success]: "bg-[#248046] dark:bg-[#248046]",
                  [ButtonStyle.Danger]: "bg-[#da373c]",
                }[component.style],
              )}
            >
              {isLinkButton(component) && (
                <CoolIcon icon="External_Link" className="block" />
              )}
            </div>
          ) : (
            <div className="rounded bg-[#6d6f78] dark:bg-[#4e5058] p-[5px_5px_4px_4px]">
              <CoolIcon
                icon={
                  (
                    {
                      [ComponentType.StringSelect]: "Chevron_Down",
                      [ComponentType.UserSelect]: "Users",
                      [ComponentType.RoleSelect]: "Tag",
                      [ComponentType.MentionableSelect]: "Mention",
                      [ComponentType.ChannelSelect]: "Chat",
                    } as Record<(typeof component)["type"], CoolIconsGlyph>
                  )[component.type]
                }
                className="block"
              />
            </div>
          )}
        </div>
        <p className="truncate my-auto">
          {previewText ||
            `${t(`component.${component.type}`)} ${
              component.type === 2 ? index + 1 : ""
            }`}
        </p>
      </button>
      <div className="ltr:ml-auto rtl:mr-auto text-lg space-x-2.5 rtl:space-x-reverse my-auto shrink-0 p-2 pl-0">
        <button
          type="button"
          className={index === 0 ? "hidden" : ""}
          disabled={anySubmitting}
          onClick={() => {
            row.components.splice(index, 1);
            row.components.splice(index - 1, 0, component);
            updateRow();
          }}
        >
          <CoolIcon icon="Chevron_Up" />
        </button>
        <button
          type="button"
          className={index === row.components.length - 1 ? "hidden" : ""}
          disabled={anySubmitting}
          onClick={() => {
            row.components.splice(index, 1);
            row.components.splice(index + 1, 0, component);
            updateRow();
          }}
        >
          <CoolIcon icon="Chevron_Down" />
        </button>
        <button
          type="button"
          className={getRowWidth(row) >= 5 ? "hidden" : ""}
          disabled={anySubmitting}
          onClick={async () => {
            // Don't accidentally save the current component
            const { custom_id: _, ...withoutId } = component;
            const copied = await submitComponent(withoutId as typeof component);
            if (copied) {
              // Should always be non-null
              row.components.splice(index + 1, 0, copied);
              updateRow();
            }
          }}
        >
          <CoolIcon icon="Copy" />
        </button>
        <button
          type="button"
          disabled={anySubmitting}
          onClick={() => {
            // TODO: delete request
            row.components.splice(index, 1);
            updateRow();
          }}
        >
          <CoolIcon icon="Trash_Full" />
        </button>
      </div>
    </div>
  );
};

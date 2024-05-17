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
import { BRoutes, apiUrl } from "~/api/routing";
import { action as ApiPostComponents } from "~/api/v1/components";
import { EditingComponentData } from "~/modals/ComponentEditModal";
import { getQdMessageId } from "~/routes/_index";
import {
  APIButtonComponent,
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
import { ButtonSelect } from "../ButtonSelect";
import { InfoBox } from "../InfoBox";
import { CoolIcon, CoolIconsGlyph } from "../icons/CoolIcon";

export const getComponentText = (
  component: APIMessageComponent,
): string | undefined =>
  component.type === ComponentType.Button
    ? component.label ?? component.emoji?.name
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
      if (!component.emoji && !component.label) {
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

const submitComponent = async (data: APIMessageActionRowComponent) => {
  /**
   * This is a bit of a dance, we basically just want to generate a
   * server ID for these components so they can remain synced. From
   * this point forward, the user has to submit a PATCH request in
   * order to modify anything about a component (other than its
   * position).
   * We use the returned data from the server just in case it wanted
   * to change something.
   * You can also do this while logged out.
   */
  const response = await fetch(apiUrl(BRoutes.components()), {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    console.error(response.status, response.statusText);
    return;
  }
  const raw = (await response.json()) as SerializeFrom<
    typeof ApiPostComponents
  >;
  let component: APIMessageActionRowComponent | undefined;
  switch (raw.data.type) {
    case ComponentType.Button: {
      // if (raw.data.style === ButtonStyle.Link) {
      //   component = {
      //     ...raw.data,
      //     custom_id: `p_${raw.id}`,
      //     // url: (() => {new URL(raw.data.url).searchParams.set("dhc-id", String(raw.id))})()
      //   };
      //   break;
      // }
      component = {
        ...raw.data,
        custom_id: `p_${raw.id}`,
      };
      break;
    }
    case ComponentType.StringSelect: {
      const { minValues, maxValues, ...rest } = raw.data;
      component = {
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
      // @ts-expect-error
      component = {
        ...rest,
        custom_id: `p_${raw.id}`,
        min_values: minValues,
        max_values: maxValues,
        default_values: defaultValues,
      };
      break;
    }
    default:
      break;
  }
  return component;
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

  // if (cache) {
  //   const requests = row.components
  //     .filter(
  //       (
  //         component,
  //       ): component is
  //         | APIRoleSelectComponent
  //         | APIUserSelectComponent
  //         | APIMentionableSelectComponent
  //         | APIChannelSelectComponent =>
  //         [
  //           ComponentType.RoleSelect,
  //           ComponentType.UserSelect,
  //           ComponentType.MentionableSelect,
  //           ComponentType.ChannelSelect,
  //         ].includes(component.type),
  //     )
  //     .map(
  //       (component) =>
  //         component.default_values
  //           ?.filter((val) => isSnowflake(val.id))
  //           .map((val) =>
  //             val.type === SelectMenuDefaultValueType.User
  //               ? `member:@global-${val.id}`
  //               : `${val.type}:${val.id}`,
  //           ) ?? [],
  //     )
  //     .reduce((prev, cur) => {
  //       prev.push(...cur);
  //       return prev;
  //     }, []);

  //   cache.resolveMany(new Set(requests));
  // }

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
      <div className="space-y-1 mb-1">
        {row.components.map((component, ci) => {
          const id =
            ("custom_id" in component
              ? component.custom_id?.replace(/^p_/, "")
              : // : (() => {
                //     try {
                //       const url = new URL(component.url);
                //       return url.searchParams.get("dhc-id") ?? randomString(10);
                //     } catch {
                //       return component.url;
                //     }
                //   })();
                undefined) ?? `${i}:${ci}`;

          return (
            <IndividualComponentEditor
              key={`edit-message-${mid}-component-${id}`}
              component={component}
              index={ci}
              row={row}
              updateRow={() => setData({ ...data })}
              onClick={() => {
                setEditingComponent({
                  component: {
                    ...component,
                    ...((component.type === ComponentType.Button &&
                      component.style !== ButtonStyle.Link) ||
                    component.type === ComponentType.UserSelect ||
                    component.type === ComponentType.RoleSelect ||
                    component.type === ComponentType.MentionableSelect ||
                    component.type === ComponentType.ChannelSelect
                      ? { flow: component.flow ?? { actions: [] } }
                      : component.type === ComponentType.StringSelect
                        ? { flows: component.flows ?? {} }
                        : {}),
                  },
                  update: () => setData({ ...data }),
                });
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
                url: "",
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
            const component = await submitComponent(submitData);
            if (component) {
              row.components.push(component);
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
  return (
    <div className="flex text-base text-gray-600 dark:text-gray-400 rounded bg-blurple/10 hover:bg-blurple/15 border border-blurple/30 shadow hover:shadow-lg transition font-semibold select-none">
      <button
        type="button"
        className="flex p-2 h-full w-full my-auto"
        onClick={onClick}
      >
        <div className="ltr:mr-2 rtl:ml-2 my-auto w-6 h-6">
          {component.type === ComponentType.Button ? (
            <div
              className={twJoin(
                "rounded",
                isLinkButton(component)
                  ? "p-[5px_5px_4px_4px]"
                  : "w-full h-full",
                {
                  [ButtonStyle.Primary]: "bg-blurple",
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
        <span className="truncate my-auto">
          {previewText ||
            `${t(`component.${component.type}`)} ${
              component.type === 2 ? index + 1 : ""
            }`}
        </span>
      </button>
      <div className="ltr:ml-auto rtl:mr-auto text-lg space-x-2.5 rtl:space-x-reverse my-auto shrink-0 p-2 pl-0">
        <button
          type="button"
          className={index === 0 ? "hidden" : ""}
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
          onClick={async () => {
            const copied = await submitComponent(component);
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

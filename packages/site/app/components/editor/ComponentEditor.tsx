import { Link } from "@remix-run/react";
import {
  APIActionRowComponent,
  APIButtonComponent,
  APIChannelSelectComponent,
  APIMentionableSelectComponent,
  APIMessageActionRowComponent,
  APIMessageComponent,
  APIRoleSelectComponent,
  APISelectMenuOption,
  APIStringSelectComponent,
  APITextInputComponent,
  APIUserSelectComponent,
  ButtonStyle,
  ComponentType,
  SelectMenuDefaultValueType,
} from "discord-api-types/v10";
import { isSnowflake } from "discord-snowflake";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { EditingFlowData } from "~/modals/FlowEditModal";
import { getQdMessageId } from "~/routes/_index";
import { Flow } from "~/store.server";
import { QueryData, QueryDataComponent } from "~/types/QueryData";
import { CacheManager } from "~/util/cache/CacheManager";
import { randomString } from "~/util/text";
import { Button } from "../Button";
import { ButtonSelect } from "../ButtonSelect";
import { Checkbox } from "../Checkbox";
import { InfoBox } from "../InfoBox";
import { StringSelect } from "../StringSelect";
import { TextInput } from "../TextInput";
import { CoolIcon } from "../icons/CoolIcon";
import { linkClassName } from "../preview/Markdown";
import { PopoutEmojiPicker } from "./EmojiPicker";

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

export const ActionRowEditor: React.FC<{
  message: QueryData["messages"][number];
  row: APIActionRowComponent<APIMessageActionRowComponent>;
  rowIndex: number;
  data: QueryData;
  setData: React.Dispatch<QueryData>;
  setComponents: (value: QueryDataComponent[]) => void;
  setEditingFlow: React.Dispatch<
    React.SetStateAction<EditingFlowData | undefined>
  >;
  cache?: CacheManager;
  open?: boolean;
}> = ({
  message,
  row,
  rowIndex: i,
  data,
  setData,
  setComponents,
  setEditingFlow,
  cache,
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
              const copied = (
                data.components?.[mid].filter((c) =>
                  row.components
                    .filter((rc) => "custom_id" in rc)
                    .map((rc) => rc.custom_id)
                    .includes(`p_${c.id}`),
                ) ?? []
              ).map((d) => structuredClone(d));
              // This also calls setData
              setComponents([...(data.components?.[mid] ?? []), ...copied]);
            }}
          >
            <CoolIcon icon="Copy" />
          </button>
          <button
            type="button"
            onClick={() => {
              message.data.components?.splice(i, 1);
              const withoutRow =
                data.components?.[mid].filter(
                  (c) =>
                    !row.components
                      .filter((rc) => "custom_id" in rc)
                      .map((rc) => rc.custom_id)
                      .includes(`p_${c.id}`),
                ) ?? [];
              setComponents(withoutRow);
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
      <div className="ml-1 ltr:md:ml-2 rtl:md:mr-2">
        {row.components.map((component, ci, a) => {
          const qdComponents = data.components?.[mid] ?? [];
          const qComponent = qdComponents.find(
            (c) =>
              "custom_id" in component &&
              c.id === component.custom_id.replace(/^p_/, ""),
          );
          return (
            <div
              key={`edit-message-${mid}-row-${i}-component-${component.type}-${ci}`}
            >
              <IndividualComponentEditor
                component={component}
                index={ci}
                row={row}
                updateRow={() => setData({ ...data })}
                copyQdComponent={() => {
                  const newId = String(
                    Math.floor(Math.random() * 100000000000),
                  );
                  if (qComponent) {
                    const copied = structuredClone(qComponent);
                    copied.id = newId;
                    qdComponents.splice(
                      qdComponents.indexOf(qComponent),
                      0,
                      copied,
                    );
                  }
                  setComponents(qdComponents);
                  return newId;
                }}
                removeQdComponent={() => {
                  if (qComponent) {
                    qdComponents.splice(qdComponents.indexOf(qComponent), 1);
                  }
                  setComponents(qdComponents);
                }}
                open={component.type !== ComponentType.Button || open}
              >
                {component.type === ComponentType.Button ? (
                  <>
                    <div className="flex">
                      <div className="ltr:mr-2 rtl:ml-2 mt-auto">
                        <p className="text-sm cursor-default font-medium">
                          Emoji
                        </p>
                        <PopoutEmojiPicker
                          emoji={component.emoji}
                          emojis={cache ? cache.emoji.getAll() : []}
                          setEmoji={(emoji) => {
                            component.emoji = emoji;
                            setData({ ...data });
                          }}
                        />
                      </div>
                      <div className="grow">
                        <TextInput
                          label="Label"
                          className="w-full"
                          value={component.label ?? ""}
                          onInput={(e) => {
                            component.label =
                              e.currentTarget.value || undefined;
                            setData({ ...data });
                          }}
                          maxLength={80}
                        />
                      </div>
                      <div className="ltr:ml-2 rtl:mr-2 my-auto">
                        <Checkbox
                          label="Disabled"
                          checked={component.disabled ?? false}
                          onChange={(e) => {
                            component.disabled = e.currentTarget.checked;
                            setData({ ...data });
                          }}
                        />
                      </div>
                    </div>
                    {component.style === ButtonStyle.Link ? (
                      <TextInput
                        label="URL"
                        type="url"
                        className="w-full"
                        value={component.url}
                        onInput={(e) => {
                          component.url = e.currentTarget.value;
                          setData({ ...data });
                        }}
                      />
                    ) : (
                      <div>
                        <p className="text-sm font-medium cursor-default">
                          Style
                        </p>
                        <div className="grid gap-1 grid-cols-4">
                          {(
                            [
                              ButtonStyle.Primary,
                              ButtonStyle.Secondary,
                              ButtonStyle.Success,
                              ButtonStyle.Danger,
                            ] as const
                          ).map((style) => (
                            <ButtonStylePicker
                              key={`edit-message-${mid}-row-${i}-component-${component.type}-${ci}-style-${style}`}
                              style={style}
                              component={component}
                              update={() => setData({ ...data })}
                            />
                          ))}
                        </div>
                        <div className="mt-1">
                          <p className="text-sm font-medium cursor-default">
                            <Trans
                              t={t}
                              i18nKey="flowLink"
                              components={[
                                <Link
                                  to="/guide/getting-started/flows"
                                  target="_blank"
                                  className={twJoin(
                                    linkClassName,
                                    "cursor-pointer",
                                  )}
                                />,
                              ]}
                            />
                          </p>
                          <Button
                            onClick={async () => {
                              let flow: Flow;
                              if (qComponent) {
                                if ("flow" in qComponent.data) {
                                  flow = qComponent.data.flow as Flow;
                                } else {
                                  return;
                                }
                              } else {
                                // We just need a unique ID for state. We don't
                                // generate a snowflake here because it would be
                                // confusing. These IDs are replaced later by the
                                // server.
                                const newId = randomString(10);
                                component.custom_id = `p_${newId}`;
                                flow = {
                                  name: "Flow",
                                  actions: [{ type: 0 }],
                                };
                                setComponents([
                                  ...qdComponents,
                                  {
                                    id: newId,
                                    data: { flow },
                                    draft: true,
                                  },
                                ]);
                              }

                              setEditingFlow({
                                flow,
                                setFlow: (newFlow) => {
                                  if (qComponent) {
                                    // @ts-expect-error
                                    qComponent.data.flow = newFlow;
                                  }
                                  setComponents([...(qdComponents ?? [])]);
                                },
                              });
                            }}
                          >
                            {t(qComponent ? "editFlow" : "addFlow")}
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  [
                    ComponentType.StringSelect,
                    ComponentType.UserSelect,
                    ComponentType.RoleSelect,
                    ComponentType.MentionableSelect,
                    ComponentType.ChannelSelect,
                  ].includes(component.type) && (
                    <>
                      <div className="flex">
                        <div className="grow">
                          <TextInput
                            label="Placeholder"
                            value={component.placeholder ?? ""}
                            placeholder={t("defaultPlaceholder")}
                            maxLength={150}
                            className="w-full"
                            onInput={(e) => {
                              component.placeholder =
                                e.currentTarget.value || undefined;
                              setData({ ...data });
                            }}
                          />
                        </div>
                        <div className="ltr:ml-2 rtl:mr-2 my-auto">
                          <Checkbox
                            label="Disabled"
                            checked={component.disabled ?? false}
                            onChange={(e) => {
                              component.disabled = e.currentTarget.checked;
                              setData({ ...data });
                            }}
                          />
                        </div>
                      </div>
                      {component.type === ComponentType.StringSelect ? (
                        <>
                          <div
                            className={
                              component.options.length === 0 ? "" : "pt-2 -mb-2"
                            }
                          >
                            {component.options.map((option, oi) => (
                              <SelectMenuOptionsSection
                                key={`edit-message-${mid}-row-${i}-component-${component.type}-${ci}-option-${oi}`}
                                option={option}
                                index={oi}
                                component={component}
                                update={() => setData({ ...data })}
                              >
                                <div className="flex">
                                  <div className="ltr:mr-2 rtl:ml-2 mt-auto">
                                    <p className="text-sm cursor-default font-medium">
                                      {t("emoji")}
                                    </p>
                                    <PopoutEmojiPicker
                                      emoji={option.emoji}
                                      emojis={cache ? cache.emoji.getAll() : []}
                                      setEmoji={(emoji) => {
                                        option.emoji = emoji;
                                        setData({ ...data });
                                      }}
                                    />
                                  </div>
                                  <div className="grow">
                                    <TextInput
                                      label={t("label")}
                                      className="w-full"
                                      value={option.label ?? ""}
                                      maxLength={100}
                                      onInput={(e) => {
                                        option.label = e.currentTarget.value;
                                        setData({ ...data });
                                      }}
                                      required
                                    />
                                  </div>
                                  <div className="ltr:ml-2 rtl:mr-2 my-auto">
                                    <Checkbox
                                      label={t("default")}
                                      checked={option.default ?? false}
                                      onChange={(e) => {
                                        option.default =
                                          e.currentTarget.checked;
                                        setData({ ...data });
                                      }}
                                    />
                                  </div>
                                </div>
                                <TextInput
                                  label={t("description")}
                                  className="w-full"
                                  value={option.description ?? ""}
                                  maxLength={100}
                                  onInput={(e) => {
                                    option.description =
                                      e.currentTarget.value || undefined;
                                    setData({ ...data });
                                  }}
                                />
                                <div className="flex">
                                  <div className="grow">
                                    <TextInput
                                      label={t("valueHidden")}
                                      className="w-full"
                                      value={option.value ?? ""}
                                      maxLength={100}
                                      onInput={(e) => {
                                        option.value = e.currentTarget.value;
                                        setData({ ...data });
                                      }}
                                      required
                                    />
                                  </div>
                                  <Button
                                    className="mt-auto ltr:ml-2 rtl:mr-2"
                                    onClick={async () => {
                                      const flows = (
                                        qComponent && "flows" in qComponent.data
                                          ? qComponent.data.flows
                                          : {}
                                      ) as Record<string, Flow>;
                                      let flow: Flow;
                                      if (!qComponent) {
                                        const newId = randomString(10);
                                        flow = {
                                          name: "Flow",
                                          actions: [{ type: 0 }],
                                        };
                                        setComponents([
                                          ...qdComponents,
                                          {
                                            id: newId,
                                            data: { flow },
                                            draft: true,
                                          },
                                        ]);
                                      } else if (!flows[option.value]) {
                                        flow = flow = {
                                          name: "Flow",
                                          actions: [{ type: 0 }],
                                        };
                                        flows[option.value] = flow;
                                        // @ts-expect-error
                                        qComponent.data.flows = flows;
                                        setComponents([...qdComponents]);
                                      } else {
                                        flow = flows[option.value];
                                      }

                                      setEditingFlow({
                                        flow,
                                        setFlow: (newFlow) => {
                                          if (qComponent?.data) {
                                            flows[option.value] = newFlow;
                                            // @ts-expect-error
                                            qComponent.data.flows = flows;
                                          }
                                          setComponents([
                                            ...(qdComponents ?? []),
                                          ]);
                                        },
                                      });
                                    }}
                                  >
                                    {t(
                                      // @ts-expect-error
                                      qComponent?.data?.flows?.[option.value]
                                        ? "editFlow"
                                        : "addFlow",
                                    )}
                                  </Button>
                                </div>
                              </SelectMenuOptionsSection>
                            ))}
                          </div>
                          <Button
                            disabled={component.options.length >= 25}
                            onClick={() => {
                              // For most users, the option value is not
                              // something they need to worry about, so we auto-
                              // fill it.
                              component.options.push({
                                label: "",
                                value: randomString(10),
                              });
                              setData({ ...data });
                            }}
                          >
                            {t("addOption")}
                          </Button>
                        </>
                      ) : (
                        <>
                          <div
                            className={
                              !component.default_values ||
                              component.default_values.length === 0
                                ? ""
                                : "pt-2 -mb-2"
                            }
                          >
                            {component.default_values?.map((value, vi) => {
                              // We don't want to accidentally double-fetch here
                              const resolved =
                                isSnowflake(value.id) && cache
                                  ? value.type ===
                                    SelectMenuDefaultValueType.User
                                    ? cache.member.get(value.id)
                                    : value.type ===
                                        SelectMenuDefaultValueType.Role
                                      ? cache.role.get(value.id)
                                      : cache.channel.get(value.id)
                                  : undefined;

                              return (
                                <div
                                  key={`edit-message-${mid}-row-${i}-component-${component.type}-${ci}-value-${vi}`}
                                >
                                  <div className="flex">
                                    <div className="grow">
                                      <TextInput
                                        label={t(
                                          resolved !== undefined
                                            ? "idMention"
                                            : "idText",
                                          {
                                            replace: {
                                              mention: resolved
                                                ? "user" in resolved
                                                  ? `@${resolved.user.username}`
                                                  : "type" in resolved
                                                    ? `#${
                                                        resolved.name ??
                                                        t("mention.unknown")
                                                      }`
                                                    : `@${resolved.name}`
                                                : resolved === null
                                                  ? value.type ===
                                                    SelectMenuDefaultValueType.Channel
                                                    ? `#${t("mention.unknown")}`
                                                    : `@${t("mention.unknown")}`
                                                  : undefined,
                                            },
                                          },
                                        )}
                                        className="w-full"
                                        value={value.id}
                                        pattern="^\d{17,22}$"
                                        onChange={(e) => {
                                          value.id = e.currentTarget.value;
                                          setData({ ...data });
                                        }}
                                        required
                                      />
                                    </div>
                                    {component.type ===
                                      ComponentType.MentionableSelect && (
                                      <div className="ltr:ml-2 rtl:mr-2 mt-auto">
                                        <StringSelect
                                          label={t("type")}
                                          // className="shrink-0"
                                          options={[
                                            {
                                              label: t("user"),
                                              value:
                                                SelectMenuDefaultValueType.User,
                                            },
                                            {
                                              label: t("role"),
                                              value:
                                                SelectMenuDefaultValueType.Role,
                                            },
                                          ]}
                                          value={{
                                            label: t(value.type),
                                            value: value.type,
                                          }}
                                          onChange={(raw) => {
                                            const opt = raw as {
                                              label: string;
                                              value:
                                                | SelectMenuDefaultValueType.User
                                                | SelectMenuDefaultValueType.Role;
                                            };
                                            value.type = opt.value;
                                            setData({ ...data });
                                          }}
                                        />
                                      </div>
                                    )}
                                    <div className="ltr:ml-2 rtl:mr-2 mt-auto">
                                      <Button
                                        discordstyle={ButtonStyle.Danger}
                                        onClick={() => {
                                          // @ts-expect-error
                                          component.default_values =
                                            component.default_values?.filter(
                                              (v) =>
                                                !(
                                                  v.id === value.id &&
                                                  v.type === value.type
                                                ),
                                            );
                                          setData({ ...data });
                                        }}
                                      >
                                        <CoolIcon icon="Trash_Full" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <Button
                            // Is there not a limit for this?
                            // disabled={component.options.length >= 25}
                            onClick={() => {
                              component.default_values =
                                component.default_values ?? [];
                              component.default_values.push(
                                // @ts-expect-error
                                // This is perfectly cromulent
                                component.type === ComponentType.UserSelect ||
                                  component.type ===
                                    ComponentType.MentionableSelect
                                  ? {
                                      id: "",
                                      type: SelectMenuDefaultValueType.User,
                                    }
                                  : component.type === ComponentType.RoleSelect
                                    ? {
                                        id: "",
                                        type: SelectMenuDefaultValueType.User,
                                      }
                                    : {
                                        id: "",
                                        type: SelectMenuDefaultValueType.Channel,
                                      },
                              );
                              setData({ ...data });
                            }}
                          >
                            {t("addDefaultValue")}
                          </Button>
                        </>
                      )}
                    </>
                  )
                )}
              </IndividualComponentEditor>
              {ci < a.length - 1 && (
                <hr className="border border-gray-500/20 mb-3" />
              )}
            </div>
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
        onChange={(v) => {
          const { value: type } = v as { value: ComponentType | "linkButton" };
          switch (type) {
            case "linkButton": {
              row.components.push({
                type: ComponentType.Button,
                style: ButtonStyle.Link,
                url: "",
              });
              break;
            }
            case ComponentType.Button: {
              row.components.push({
                type,
                style: ButtonStyle.Primary,
                custom_id: "",
              });
              break;
            }
            case ComponentType.StringSelect: {
              row.components.push({
                type,
                options: [],
                custom_id: "",
              });
              break;
            }
            case ComponentType.UserSelect:
            case ComponentType.RoleSelect:
            case ComponentType.MentionableSelect:
            case ComponentType.ChannelSelect: {
              row.components.push({
                type,
                custom_id: "",
              });
              break;
            }
            default:
              break;
          }
          setData({ ...data });
        }}
      >
        {t("addComponent")}
      </ButtonSelect>
    </details>
  );
};

export const ButtonStylePicker: React.FC<{
  style: ButtonStyle;
  component: APIButtonComponent;
  update: () => void;
}> = ({ style, component, update }) => (
  <Button
    className="block min-h-0 h-7 !p-0"
    discordstyle={style}
    onClick={() => {
      component.style = style;
      update();
    }}
  >
    {component.style === style && <CoolIcon icon="Check" className="text-xl" />}
  </Button>
);

export const IndividualComponentEditor: React.FC<
  React.PropsWithChildren<{
    component: APIMessageActionRowComponent;
    index: number;
    row: APIActionRowComponent<APIMessageActionRowComponent>;
    updateRow: () => void;
    copyQdComponent: () => string;
    removeQdComponent: () => void;
    open?: boolean;
  }>
> = ({
  component,
  index,
  row,
  updateRow,
  copyQdComponent,
  removeQdComponent,
  open,
  children,
}) => {
  const { t } = useTranslation();
  const previewText = getComponentText(component);
  return (
    <details className="group/component pb-2 -my-1" open={open}>
      <summary className="group-open/component:mb-2 transition-[margin] marker:content-none marker-none flex text-base text-gray-600 dark:text-gray-400 font-semibold cursor-default select-none">
        <CoolIcon
          icon="Chevron_Right"
          className="group-open/component:rotate-90 ltr:mr-2 rtl:ml-2 my-auto transition-transform"
        />
        <span className="truncate">
          {t(`component.${component.type}`)} {component.type === 2 && index + 1}
          {previewText && ` - ${previewText}`}
        </span>
        <div className="ltr:ml-auto rtl:mr-auto text-lg space-x-2.5 rtl:space-x-reverse my-auto shrink-0">
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
            onClick={() => {
              const newId = copyQdComponent();
              const copied = structuredClone(component);
              if ("custom_id" in copied) {
                copied.custom_id = `p_${newId}`;
              }
              row.components.splice(index + 1, 0, copied);
              updateRow();
            }}
          >
            <CoolIcon icon="Copy" />
          </button>
          <button
            type="button"
            onClick={() => {
              row.components.splice(index, 1);
              removeQdComponent();
              // updateRow();
            }}
          >
            <CoolIcon icon="Trash_Full" />
          </button>
        </div>
      </summary>
      <div className="space-y-2 mb-2">{children}</div>
    </details>
  );
};

export const SelectMenuOptionsSection: React.FC<
  React.PropsWithChildren<{
    option: APISelectMenuOption;
    index: number;
    component: APIStringSelectComponent;
    update: () => void;
    open?: boolean;
  }>
> = ({ option, index, component, update, open, children }) => {
  const previewText = option.label || option.description;
  return (
    <details className="group/select-option pb-2 -my-1" open={open}>
      <summary className="group-open/select-option:mb-2 transition-[margin] marker:content-none marker-none flex text-base text-gray-600 dark:text-gray-400 font-semibold cursor-default select-none">
        <CoolIcon
          icon="Chevron_Right"
          className="group-open/select-option:rotate-90 ltr:mr-2 rtl:ml-2 my-auto transition-transform"
        />
        <span className="shrink-0">Option {index + 1}</span>
        {previewText && <span className="truncate ml-1">- {previewText}</span>}
        <div className="ml-auto text-lg space-x-2.5 rtl:space-x-reverse my-auto shrink-0">
          <button
            type="button"
            className={index === 0 ? "hidden" : ""}
            onClick={() => {
              component.options.splice(index, 1);
              component.options.splice(index - 1, 0, option);
              update();
            }}
          >
            <CoolIcon icon="Chevron_Up" />
          </button>
          <button
            type="button"
            className={index === component.options.length - 1 ? "hidden" : ""}
            onClick={() => {
              component.options.splice(index, 1);
              component.options.splice(index + 1, 0, option);
              update();
            }}
          >
            <CoolIcon icon="Chevron_Down" />
          </button>
          <button
            type="button"
            className={component.options.length >= 25 ? "hidden" : ""}
            onClick={() => {
              component.options.splice(index + 1, 0, structuredClone(option));
              update();
            }}
          >
            <CoolIcon icon="Copy" />
          </button>
          <button
            type="button"
            onClick={() => {
              component.options.splice(index, 1);
              update();
            }}
          >
            <CoolIcon icon="Trash_Full" />
          </button>
        </div>
      </summary>
      <div className="space-y-2 mb-2">{children}</div>
    </details>
  );
};

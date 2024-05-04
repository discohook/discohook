import { Link } from "@remix-run/react";
import {
  APIActionRowComponent,
  APIButtonComponent,
  APIChannelSelectComponent,
  APIMentionableSelectComponent,
  APIMessageActionRowComponent,
  APIMessageComponent,
  APIMessageComponentEmoji,
  APIRoleSelectComponent,
  APISelectMenuOption,
  APIStringSelectComponent,
  APITextInputComponent,
  APIUserSelectComponent,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { Flow } from "~/store.server";
import { QueryData, QueryDataComponent } from "~/types/QueryData";
import { CacheManager } from "~/util/cache/CacheManager";
import { Button } from "../Button";
import { ButtonSelect } from "../ButtonSelect";
import { Checkbox } from "../Checkbox";
import { InfoBox } from "../InfoBox";
import { TextInput } from "../TextInput";
import { CoolIcon } from "../icons/CoolIcon";
import { linkClassName } from "../preview/Markdown";
import { PopoutEmojiPicker } from "./EmojiPicker";
import { FlowEditor } from "./FlowEditor";

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

export const componentMatches = (
  left: APIMessageActionRowComponent,
  right: QueryDataComponent,
) => "custom_id" in left && left.custom_id === `p_${right.id}`;

export const ActionRowEditor: React.FC<{
  message: QueryData["messages"][number];
  row: APIActionRowComponent<APIMessageActionRowComponent>;
  rowIndex: number;
  data: QueryData;
  setData: React.Dispatch<QueryData>;
  setComponents: (value: QueryDataComponent[]) => void;
  cache?: CacheManager;
  emojis?: APIMessageComponentEmoji[];
  open?: boolean;
}> = ({
  message,
  row,
  rowIndex: i,
  data,
  setData,
  setComponents,
  cache,
  emojis,
  open,
}) => {
  const { t } = useTranslation();
  const mi = data.messages.indexOf(message);
  const errors = getComponentErrors(row);
  return (
    <details className="group/action-row" open={open}>
      <summary className="group-open/action-row:mb-2 transition-[margin] marker:content-none marker-none flex text-base text-gray-600 dark:text-gray-400 font-semibold cursor-default select-none">
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
              const copied =
                data.components?.[mi].filter((c) =>
                  row.components
                    .filter((rc) => "custom_id" in rc)
                    .map((rc) => rc.custom_id)
                    .includes(`p_${c.id}`),
                ) ?? [];
              // This also calls setData
              setComponents([...(data.components?.[mi] ?? []), ...copied]);
            }}
          >
            <CoolIcon icon="Copy" />
          </button>
          <button
            type="button"
            onClick={() => {
              message.data.components?.splice(i, 1);
              const withoutRow =
                data.components?.[mi].filter(
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
        {row.components.map((component, ci) => {
          const qdComponents = data.components?.[mi] ?? [];
          const qComponent = qdComponents.find(
            (c) =>
              "custom_id" in component &&
              c.id === component.custom_id.replace(/^p_/, ""),
          );
          return (
            <IndividualComponentEditor
              key={`edit-message-${mi}-row-${i}-component-${component.type}-${ci}`}
              component={component}
              index={ci}
              row={row}
              updateRow={() => setData({ ...data })}
              copyQdComponent={() => {
                const newId = String(Math.floor(Math.random() * 100000000000));
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
                        emojis={emojis}
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
                          component.label = e.currentTarget.value || undefined;
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
                            key={`edit-message-${mi}-row-${i}-component-${component.type}-${ci}-style-${style}`}
                            style={style}
                            component={component}
                            update={() => setData({ ...data })}
                          />
                        ))}
                      </div>
                      {!qComponent && (
                        <div className="mt-1">
                          <Button
                            onClick={async () => {
                              // We just need a unique ID for state. We don't
                              // generate a snowflake here because it would be
                              // confusing. These IDs are replaced later by the
                              // server.
                              const newId = String(
                                Math.floor(Math.random() * 100000000000),
                              );
                              component.custom_id = `p_${newId}`;
                              setComponents([
                                ...qdComponents,
                                {
                                  id: newId,
                                  data: {
                                    flow: {
                                      name: "Flow",
                                      actions: [{ type: 0 }],
                                    },
                                  },
                                  draft: true,
                                },
                              ]);
                            }}
                          >
                            Add Flow
                          </Button>
                        </div>
                      )}
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
                    {component.type === ComponentType.StringSelect && (
                      <>
                        <div className="pt-2 -mb-2">
                          {component.options.map((option, oi) => (
                            <SelectMenuOptionsSection
                              key={`edit-message-${mi}-row-${i}-component-${component.type}-${ci}-option-${oi}`}
                              option={option}
                              index={oi}
                              component={component}
                              update={() => setData({ ...data })}
                            >
                              <div className="flex">
                                <div className="grow">
                                  <TextInput
                                    label="Label"
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
                                    label="Default"
                                    checked={option.default ?? false}
                                    onChange={(e) => {
                                      option.default = e.currentTarget.checked;
                                      setData({ ...data });
                                    }}
                                  />
                                </div>
                              </div>
                              <PopoutEmojiPicker
                                emoji={option.emoji}
                                setEmoji={(emoji) => {
                                  option.emoji = emoji;
                                  setData({ ...data });
                                }}
                              />
                              <TextInput
                                label="Description"
                                className="w-full"
                                value={option.description ?? ""}
                                maxLength={100}
                                onInput={(e) => {
                                  option.description = e.currentTarget.value;
                                  setData({ ...data });
                                }}
                              />
                              <TextInput
                                label="Value (hidden)"
                                className="w-full"
                                value={option.value ?? ""}
                                maxLength={100}
                                onInput={(e) => {
                                  option.value = e.currentTarget.value;
                                  setData({ ...data });
                                }}
                                required
                              />
                            </SelectMenuOptionsSection>
                          ))}
                        </div>
                        <Button
                          className=""
                          disabled={component.options.length >= 25}
                          onClick={() => {
                            component.options.push({
                              label: "",
                              value: "",
                            });
                            setData({ ...data });
                          }}
                        >
                          Add Option
                        </Button>
                      </>
                    )}
                  </>
                )
              )}
              {qComponent &&
                !!(qComponent.data.flow || qComponent.data.flows) && (
                  <div>
                    <p className="text-sm font-medium cursor-default">
                      Flow (
                      <Link
                        to="/flows"
                        target="_blank"
                        className={twJoin(linkClassName, "cursor-pointer")}
                      >
                        what's a flow?
                      </Link>
                      )
                    </p>
                    {!!qComponent.data.flow && (
                      <FlowEditor
                        flow={qComponent.data.flow as Flow}
                        setFlow={(flow) => {
                          if ("flow" in qComponent.data) {
                            qComponent.data.flow = flow;
                          }
                          setComponents([...(qdComponents ?? [])]);
                        }}
                        cache={cache}
                      />
                    )}
                  </div>
                )}
            </IndividualComponentEditor>
          );
        })}
      </div>
      <ButtonSelect
        name="component-type"
        options={[
          {
            label: t("button"),
            value: "button",
            isDisabled: getRowWidth(row) >= 5,
          },
          {
            label: t("linkButton"),
            value: "link-button",
            isDisabled: getRowWidth(row) >= 5,
          },
          {
            label: t("stringSelectMenu"),
            value: "string-select",
            isDisabled: getRowWidth(row) > 0,
          },
          {
            label: t("userSelectMenu"),
            value: "user-select",
            isDisabled: getRowWidth(row) > 0,
          },
          {
            label: t("roleSelectMenu"),
            value: "role-select",
            isDisabled: getRowWidth(row) > 0,
          },
          {
            label: t("mentionableSelectMenu"),
            value: "mentionable-select",
            isDisabled: getRowWidth(row) > 0,
          },
          {
            label: t("channelSelectMenu"),
            value: "channel-select",
            isDisabled: getRowWidth(row) > 0,
          },
        ]}
        isDisabled={getRowWidth(row) >= 5}
        onChange={(v) => {
          const { value: type } = v as { value: string };
          switch (type) {
            case "button": {
              row.components.push({
                type: ComponentType.Button,
                style: ButtonStyle.Primary,
                custom_id: "",
              });
              break;
            }
            case "link-button": {
              row.components.push({
                type: ComponentType.Button,
                style: ButtonStyle.Link,
                url: "",
              });
              break;
            }
            case "string-select": {
              row.components.push({
                type: ComponentType.StringSelect,
                options: [],
                custom_id: "",
              });
              break;
            }
            case "user-select": {
              row.components.push({
                custom_id: "",
                type: ComponentType.UserSelect,
              });
              break;
            }
            case "role-select": {
              row.components.push({
                custom_id: "",
                type: ComponentType.RoleSelect,
              });
              break;
            }
            case "mentionable-select": {
              row.components.push({
                custom_id: "",
                type: ComponentType.MentionableSelect,
              });
              break;
            }
            case "channel-select": {
              row.components.push({
                custom_id: "",
                type: ComponentType.ChannelSelect,
              });
              break;
            }
            default:
              break;
          }
          setData({ ...data });
        }}
      >
        Add Component
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
  const previewText = getComponentText(component);
  return (
    <details className="group/component pb-2 -my-1" open={open}>
      <summary className="group-open/component:mb-2 transition-[margin] marker:content-none marker-none flex text-base text-gray-600 dark:text-gray-400 font-semibold cursor-default select-none">
        <CoolIcon
          icon="Chevron_Right"
          className="group-open/component:rotate-90 ltr:mr-2 rtl:ml-2 my-auto transition-transform"
        />
        <span className="shrink-0">
          {component.type === ComponentType.Button ? (
            `Button ${index + 1}`
          ) : (
            <>
              {`${
                component.type === ComponentType.UserSelect
                  ? "User"
                  : component.type === ComponentType.RoleSelect
                    ? "Role"
                    : component.type === ComponentType.MentionableSelect
                      ? "User & Role"
                      : component.type === ComponentType.ChannelSelect
                        ? "Channel"
                        : ""
              } `}
              Select Menu
            </>
          )}
        </span>
        {previewText && <span className="truncate ml-1">- {previewText}</span>}
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
  const previewText = option.label || option.description || option.value;
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

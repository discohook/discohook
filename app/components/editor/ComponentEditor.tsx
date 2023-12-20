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
} from "discord-api-types/v10";
import { QueryData } from "~/types/QueryData";
import { Button } from "../Button";
import { ButtonSelect } from "../ButtonSelect";
import { Checkbox } from "../Checkbox";
import { CoolIcon } from "../CoolIcon";
import { PopoutEmojiPicker } from "../EmojiPicker";
import { InfoBox } from "../InfoBox";
import { selectStrings } from "../StringSelect";
import { TextInput } from "../TextInput";
import { CUSTOM_EMOJI_RE } from "../preview/Markdown";

export const getComponentText = (
  component: APIMessageComponent
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
  >
): number => {
  return row.components.reduce(
    (last, component) => getComponentWidth(component) + last,
    0
  );
};

const strings = {
  rowEmpty: "Must contain at least one component (button/select)",
  labelEmpty: "Must have a label or emoji, or both",
  urlEmpty: "Link button must have a URL",
  optionsEmpty: "Must contain at least one select option",
};

export const getComponentErrors = (
  component: APIMessageComponent
): string[] => {
  const errors: string[] = [];
  switch (component.type) {
    case ComponentType.ActionRow:
      if (component.components.length === 0) {
        errors.push(strings.rowEmpty);
      }
      // if (component.components.length > 5) {
      //   errors.push("Cannot contain more than five components")
      // }
      break;
    case ComponentType.Button:
      if (!component.emoji && !component.label) {
        errors.push(strings.labelEmpty);
      }
      if (component.style === ButtonStyle.Link && !component.url) {
        errors.push(strings.urlEmpty);
      }
      break;
    case ComponentType.StringSelect:
      if (component.options.length === 0) {
        errors.push(strings.optionsEmpty);
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
  setData: React.Dispatch<React.SetStateAction<QueryData>>;
  open?: boolean;
}> = ({ message, row, rowIndex: i, data, setData, open }) => {
  const mi = data.messages.indexOf(message);
  const errors = getComponentErrors(row);
  return (
    <details className="group/action-row" open={open}>
      <summary className="group-open/action-row:mb-2 transition-[margin] marker:content-none marker-none flex text-base text-gray-600 dark:text-gray-400 font-semibold cursor-default select-none">
        <CoolIcon
          icon="Chevron_Right"
          className="group-open/action-row:rotate-90 mr-2 my-auto transition-transform"
        />
        Row {i + 1}
        <div className="ml-auto text-xl space-x-2.5 my-auto shrink-0">
          <button
            className={i === 0 ? "hidden" : ""}
            onClick={() => {
              message.data.components!.splice(i, 1);
              message.data.components!.splice(i - 1, 0, row);
              setData({ ...data });
            }}
          >
            <CoolIcon icon="Chevron_Up" />
          </button>
          <button
            className={
              i === message.data.components!.length - 1 ? "hidden" : ""
            }
            onClick={() => {
              message.data.components!.splice(i, 1);
              message.data.components!.splice(i + 1, 0, row);
              setData({ ...data });
            }}
          >
            <CoolIcon icon="Chevron_Down" />
          </button>
          <button
            className={
              message.data.components!.length - 1 + 1 >= 5 ? "hidden" : ""
            }
            onClick={() => {
              message.data.components!.splice(i + 1, 0, structuredClone(row));
              setData({ ...data });
            }}
          >
            <CoolIcon icon="Copy" />
          </button>
          <button
            onClick={() => {
              message.data.components!.splice(i, 1);
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
            {errors.join("\n")}
          </InfoBox>
        </div>
      )}
      <div className="ml-1 md:ml-2">
        {row.components.map((component, ci) => (
          <IndividualComponentEditor
            key={`edit-message-${mi}-row-${i}-component-${component.type}-${ci}`}
            component={component}
            index={ci}
            row={row}
            updateRow={() => setData({ ...data })}
            open={component.type !== ComponentType.Button}
          >
            {component.type === ComponentType.Button ? (
              <>
                <div className="flex">
                  <div className="mr-2 mt-auto">
                    <p className="text-sm cursor-default font-medium">Emoji</p>
                    <PopoutEmojiPicker
                      emoji={component.emoji}
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
                        component.label = e.currentTarget.value;
                        setData({ ...data });
                      }}
                      maxLength={80}
                    />
                  </div>
                  <div className="ml-2 my-auto">
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
                    <p className="text-sm font-medium cursor-default">Style</p>
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
                          key={`edit-message-${i}-row-${i}-component-${component.type}-${ci}-style-${style}`}
                          style={style}
                          component={component}
                          update={() => setData({ ...data })}
                        />
                      ))}
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
                        placeholder={selectStrings.defaultPlaceholder}
                        maxLength={150}
                        className="w-full"
                        onInput={(e) => {
                          component.placeholder =
                            e.currentTarget.value || undefined;
                          setData({ ...data });
                        }}
                      />
                    </div>
                    <div className="ml-2 my-auto">
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
                              <div className="ml-2 my-auto">
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
                            <TextInput
                              label="Emoji"
                              className="w-full"
                              value={
                                option.emoji?.id
                                  ? `<${option.emoji.animated ? "a" : ""}:${
                                    option.emoji.name
                                  }:${option.emoji.id}>`
                                  : option.emoji?.name ?? ""
                              }
                              onInput={(e) => {
                                const { value } = e.currentTarget;
                                if (!value) {
                                  option.emoji = undefined;
                                  setData({ ...data });
                                  return;
                                }
                                const customMatch =
                                  value.match(CUSTOM_EMOJI_RE);
                                // stockMatch = value.match(EMOJI_NAME_RE);
                                if (customMatch) {
                                  option.emoji = {
                                    id: customMatch[3],
                                    name: customMatch[2],
                                    animated: customMatch[1] === "a",
                                  };
                                  setData({ ...data });
                                }
                                // else if (stockMatch) {
                                //   option.emoji = {
                                //     name: stockMatch[1],
                                //   }
                                // }
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
          </IndividualComponentEditor>
        ))}
      </div>
      <ButtonSelect
        name="component-type"
        options={[
          {
            label: "Button",
            value: "button",
            isDisabled: getRowWidth(row) >= 5,
          },
          {
            label: "Link Button",
            value: "link-button",
            isDisabled: getRowWidth(row) >= 5,
          },
          {
            label: "String Select Menu",
            value: "string-select",
            isDisabled: getRowWidth(row) > 0,
          },
          {
            label: "User Select Menu",
            value: "user-select",
            isDisabled: getRowWidth(row) > 0,
          },
          {
            label: "Role Select Menu",
            value: "role-select",
            isDisabled: getRowWidth(row) > 0,
          },
          {
            label: "User & Role Select Menu",
            value: "mentionable-select",
            isDisabled: getRowWidth(row) > 0,
          },
          {
            label: "Channel Select Menu",
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
    open?: boolean;
  }>
> = ({ component, index, row, updateRow, open, children }) => {
  const previewText = getComponentText(component);
  return (
    <details className="group/component pb-2 -my-1" open={open}>
      <summary className="group-open/component:mb-2 transition-[margin] marker:content-none marker-none flex text-base text-gray-600 dark:text-gray-400 font-semibold cursor-default select-none">
        <CoolIcon
          icon="Chevron_Right"
          className="group-open/component:rotate-90 mr-2 my-auto transition-transform"
        />
        <span className="shrink-0">
          {component.type === ComponentType.Button ? (
            `Button ${index + 1}`
          ) : (
            <>
              {(component.type === ComponentType.UserSelect
                ? "User"
                : component.type === ComponentType.RoleSelect
                  ? "Role"
                  : component.type === ComponentType.MentionableSelect
                    ? "User & Role"
                    : component.type === ComponentType.ChannelSelect
                      ? "Channel"
                      : "") + " "}
              Select Menu
            </>
          )}
        </span>
        {previewText && <span className="truncate ml-1">- {previewText}</span>}
        <div className="ml-auto text-lg space-x-2.5 my-auto shrink-0">
          <button
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
            className={getRowWidth(row) >= 5 ? "hidden" : ""}
            onClick={() => {
              row.components.splice(index + 1, 0, structuredClone(component));
              updateRow();
            }}
          >
            <CoolIcon icon="Copy" />
          </button>
          <button
            onClick={() => {
              row.components.splice(index, 1);
              updateRow();
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
          className="group-open/select-option:rotate-90 mr-2 my-auto transition-transform"
        />
        <span className="shrink-0">Option {index + 1}</span>
        {previewText && <span className="truncate ml-1">- {previewText}</span>}
        <div className="ml-auto text-lg space-x-2.5 my-auto shrink-0">
          <button
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
            className={component.options.length >= 25 ? "hidden" : ""}
            onClick={() => {
              component.options.splice(index + 1, 0, structuredClone(option));
              update();
            }}
          >
            <CoolIcon icon="Copy" />
          </button>
          <button
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

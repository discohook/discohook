import { Link } from "@remix-run/react";
import {
  APISelectMenuOption,
  APIStringSelectComponent,
  ButtonStyle,
  ComponentType,
  SelectMenuDefaultValueType,
} from "discord-api-types/v10";
import { isSnowflake } from "discord-snowflake";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { Checkbox } from "~/components/Checkbox";
import { useError } from "~/components/Error";
import { PopoutEmojiPicker } from "~/components/editor/EmojiPicker";
import { Flow } from "~/store.server";
import {
  APIButtonComponent,
  APIMessageActionRowComponent,
} from "~/types/QueryData";
import { CacheManager } from "~/util/cache/CacheManager";
import { randomString } from "~/util/text";
import { Button } from "../components/Button";
import { StringSelect } from "../components/StringSelect";
import { TextInput } from "../components/TextInput";
import { CoolIcon } from "../components/icons/CoolIcon";
import { linkClassName } from "../components/preview/Markdown";
import { EditingFlowData } from "./FlowEditModal";
import { Modal, ModalProps } from "./Modal";

export type EditingComponentData = {
  component: APIMessageActionRowComponent;
  update: () => void;
};

export const ButtonStylePicker: React.FC<{
  style: ButtonStyle;
  component: APIButtonComponent;
  update: () => void;
}> = ({ style, component, update }) => (
  <Button
    className="block min-h-0 h-7 !p-0 !min-w-0"
    discordstyle={style}
    onClick={() => {
      component.style = style;
      update();
    }}
  >
    {component.style === style && <CoolIcon icon="Check" className="text-xl" />}
  </Button>
);

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

export const ComponentEditModal = (
  props: ModalProps &
    Partial<EditingComponentData> & {
      cache?: CacheManager;
      setEditingFlow: React.Dispatch<
        React.SetStateAction<EditingFlowData | undefined>
      >;
    },
) => {
  const { t } = useTranslation();
  const { component, update, cache, setEditingFlow } = props;
  const [error, setError] = useError();

  return (
    <Modal title={t("editComponent")} {...props}>
      {error}
      {component && update && (
        <div className="-mt-2">
          {component.type === ComponentType.Button ? (
            <>
              <div className="flex">
                <div className="ltr:mr-2 rtl:ml-2 mt-auto">
                  <p className="text-sm cursor-default font-medium">
                    {t("emoji")}
                  </p>
                  <PopoutEmojiPicker
                    emoji={component.emoji}
                    emojis={cache ? cache.emoji.getAll() : []}
                    setEmoji={(emoji) => {
                      component.emoji = emoji;
                      update();
                    }}
                  />
                </div>
                <div className="grow">
                  <TextInput
                    label={t("label")}
                    className="w-full"
                    value={component.label ?? ""}
                    onInput={(e) => {
                      component.label = e.currentTarget.value || undefined;
                      update();
                    }}
                    maxLength={80}
                  />
                </div>
                <div className="ltr:ml-2 rtl:mr-2 my-auto">
                  <Checkbox
                    label={t("disabled")}
                    checked={component.disabled ?? false}
                    onChange={(e) => {
                      component.disabled = e.currentTarget.checked;
                      update();
                    }}
                  />
                </div>
              </div>
              {component.style === ButtonStyle.Link ? (
                <TextInput
                  label={t("url")}
                  type="url"
                  className="w-full"
                  // value={(() => {
                  //   try {
                  //     const url = new URL(component.url);
                  //     url.searchParams.delete("dhc-id", id);
                  //   } catch {
                  //     return component.url;
                  //   }
                  // })()}
                  // onInput={({ currentTarget }) => {
                  //   try {
                  //     const url = new URL(currentTarget.value);
                  //     url.searchParams.set("dhc-id", id);
                  //     component.url = url.href;
                  //   } catch {
                  //     component.url = currentTarget.value;
                  //   }
                  //   update();
                  // }}
                  value={component.url}
                  onInput={({ currentTarget }) => {
                    component.url = currentTarget.value;
                    update();
                  }}
                />
              ) : (
                <div>
                  <p className="text-sm font-medium cursor-default">
                    {t("style")}
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
                        key={`component-${component.type}-style-${style}`}
                        style={style}
                        component={component}
                        update={() => update()}
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
                            className={twJoin(linkClassName, "cursor-pointer")}
                          />,
                        ]}
                      />
                    </p>
                    <Button
                      onClick={async () => {
                        const flow = component.flow ?? { actions: [] };
                        setEditingFlow({
                          flow,
                          setFlow: (newFlow) => {
                            component.flow = newFlow;
                            update();
                          },
                        });
                      }}
                    >
                      {t("editFlow")}
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
                        update();
                      }}
                    />
                  </div>
                  <div className="ltr:ml-2 rtl:mr-2 my-auto">
                    <Checkbox
                      label="Disabled"
                      checked={component.disabled ?? false}
                      onChange={(e) => {
                        component.disabled = e.currentTarget.checked;
                        update();
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
                          key={`component-${component.type}-option-${oi}`}
                          option={option}
                          index={oi}
                          component={component}
                          update={() => update()}
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
                                  update();
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
                                  update();
                                }}
                                required
                              />
                            </div>
                            <div className="ltr:ml-2 rtl:mr-2 my-auto">
                              <Checkbox
                                label={t("default")}
                                checked={option.default ?? false}
                                onChange={(e) => {
                                  option.default = e.currentTarget.checked;
                                  update();
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
                              update();
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
                                  update();
                                }}
                                required
                              />
                            </div>
                            <Button
                              className="mt-auto ltr:ml-2 rtl:mr-2"
                              onClick={async () => {
                                const flows = component.flows ?? {};
                                let flow: Flow | undefined =
                                  flows[option.value];

                                if (!flow) {
                                  flow = flow = {
                                    actions: [{ type: 0 }],
                                  };
                                  flows[option.value] = flow;
                                  component.flows = flows;
                                  update();
                                }

                                setEditingFlow({
                                  flow,
                                  setFlow: (newFlow) => {
                                    flows[option.value] = newFlow;
                                    component.flows = flows;
                                    update();
                                  },
                                });
                              }}
                            >
                              {t("editFlow")}
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
                        update();
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
                            ? value.type === SelectMenuDefaultValueType.User
                              ? cache.member.get(value.id)
                              : value.type === SelectMenuDefaultValueType.Role
                                ? cache.role.get(value.id)
                                : cache.channel.get(value.id)
                            : undefined;

                        return (
                          <div key={`component-${component.type}-value-${vi}`}>
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
                                    update();
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
                                        value: SelectMenuDefaultValueType.User,
                                      },
                                      {
                                        label: t("role"),
                                        value: SelectMenuDefaultValueType.Role,
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
                                      update();
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
                                    update();
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
                            component.type === ComponentType.MentionableSelect
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
                        update();
                      }}
                    >
                      {t("addDefaultValue")}
                    </Button>
                  </>
                )}
              </>
            )
          )}
          <div className="w-full flex mt-4">
            <Button
              className="mx-auto"
              onClick={() => {
                // saveComponent(component)
              }}
            >
              {t("save")}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
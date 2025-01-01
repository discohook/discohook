import { Link } from "@remix-run/react";
import {
  APISelectMenuOption,
  APIStringSelectComponent,
  ButtonStyle,
  ComponentType,
  SelectMenuDefaultValueType,
} from "discord-api-types/v10";
import { TFunction } from "i18next";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { Checkbox } from "~/components/Checkbox";
import { SetErrorFunction, useError } from "~/components/Error";
import { InfoBox } from "~/components/InfoBox";
import { PopoutEmojiPicker } from "~/components/editor/EmojiPicker";
import {
  APIButtonComponent,
  APIMessageActionRowComponent,
} from "~/types/QueryData";
import { CacheManager } from "~/util/cache/CacheManager";
import { isSnowflakeSafe } from "~/util/discord";
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
  setComponent: (component: APIMessageActionRowComponent) => void;
  submit: (
    component: APIMessageActionRowComponent,
    setError?: SetErrorFunction,
  ) => Promise<APIMessageActionRowComponent>;
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

export const ComponentEditForm = ({
  t,
  component,
  setComponent,
  submit,
  cache,
  setEditingFlow,
  setError,
}: Omit<EditingComponentData, "submit"> &
  Partial<Pick<EditingComponentData, "submit">> & {
    t: TFunction;
    cache?: CacheManager;
    setEditingFlow: React.Dispatch<
      React.SetStateAction<EditingFlowData | undefined>
    >;
    setError?: SetErrorFunction;
  }) => (
  <div>
    {component.type === ComponentType.Button ? (
      <>
        <div className="flex">
          <div className="ltr:mr-2 rtl:ml-2 mt-auto">
            <p className="text-sm cursor-default font-medium">{t("emoji")}</p>
            <PopoutEmojiPicker
              cache={cache}
              emoji={component.emoji}
              emojis={cache ? cache.emoji.getAll() : []}
              setEmoji={(emoji) => {
                component.emoji = emoji;
                setComponent(component);
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
                setComponent(component);
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
                setComponent(component);
              }}
            />
          </div>
        </div>
        {component.style === ButtonStyle.Link ? (
          <TextInput
            label={t("url")}
            type="url"
            className="w-full"
            value={component.url}
            onInput={({ currentTarget }) => {
              component.url = currentTarget.value;
              setComponent(component);
            }}
          />
        ) : (
          <div>
            <p className="text-sm font-medium cursor-default">{t("style")}</p>
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
                  update={() => setComponent(component)}
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
                  const flow = (component.style !== ButtonStyle.Premium
                    ? component.flow
                    : undefined) ?? { actions: [] };
                  setEditingFlow({
                    flow,
                    setFlow: (newFlow) => {
                      if (component.style !== ButtonStyle.Premium) {
                        component.flow = newFlow;
                        setComponent(component);
                      }
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
                  component.placeholder = e.currentTarget.value || undefined;
                  setComponent(component);
                }}
              />
            </div>
            <div className="ltr:ml-2 rtl:mr-2 my-auto">
              <Checkbox
                label={t("disabled")}
                checked={component.disabled ?? false}
                onChange={(e) => {
                  component.disabled = e.currentTarget.checked;
                  setComponent(component);
                }}
              />
            </div>
          </div>
          {component.type === ComponentType.StringSelect ? (
            <>
              <div
                className={component.options.length === 0 ? "" : "pt-2 -mb-2"}
              >
                {component.options.map((option, oi) => (
                  <SelectMenuOptionsSection
                    key={`component-${component.type}-option-${oi}`}
                    option={option}
                    index={oi}
                    component={component}
                    update={() => setComponent(component)}
                  >
                    <div className="flex">
                      <div className="ltr:mr-2 rtl:ml-2 mt-auto">
                        <p className="text-sm cursor-default font-medium">
                          {t("emoji")}
                        </p>
                        <PopoutEmojiPicker
                          cache={cache}
                          emoji={option.emoji}
                          emojis={cache ? cache.emoji.getAll() : []}
                          setEmoji={(emoji) => {
                            option.emoji = emoji;
                            setComponent(component);
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
                            setComponent(component);
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
                            setComponent(component);
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
                        option.description = e.currentTarget.value || undefined;
                        setComponent(component);
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
                            setComponent(component);
                          }}
                          required
                        />
                      </div>
                      <Button
                        className="mt-auto ltr:ml-2 rtl:mr-2"
                        onClick={async () => {
                          const flows = component.flows ?? {};
                          let flow: (typeof flows)[string] | undefined =
                            flows[option.value];

                          if (!flow) {
                            flow = flow = {
                              actions: [{ type: 0 }],
                            };
                            flows[option.value] = flow;
                            component.flows = flows;
                            setComponent(component);
                          }

                          setEditingFlow({
                            flow,
                            setFlow: (newFlow) => {
                              flows[option.value] = newFlow;
                              component.flows = flows;
                              setComponent(component);
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
                  setComponent(component);
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
                    : "pt-2"
                }
              >
                {component.default_values?.map((value, vi) => {
                  // We don't want to accidentally double-fetch here
                  const resolved =
                    isSnowflakeSafe(value.id) && cache
                      ? value.type === SelectMenuDefaultValueType.User
                        ? cache.member.get(value.id)
                        : value.type === SelectMenuDefaultValueType.Role
                          ? cache.role.get(value.id)
                          : cache.channel.get(value.id)
                      : undefined;

                  return (
                    <div
                      key={`component-${component.type}-value-${vi}-type-${value.type}`}
                    >
                      <div className="flex">
                        <div className="grow">
                          <TextInput
                            label={t(
                              resolved !== undefined ? "idMention" : "idText",
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
                              setComponent(component);
                            }}
                            required
                          />
                        </div>
                        {component.type === ComponentType.MentionableSelect && (
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
                                setComponent(component);
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
                                      v.id === value.id && v.type === value.type
                                    ),
                                );
                              setComponent(component);
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
              <div className="mt-2 flex gap-1">
                <Button
                  // Is there not a limit for this?
                  // disabled={component.options.length >= 25}
                  discordstyle={ButtonStyle.Secondary}
                  onClick={() => {
                    component.default_values = component.default_values ?? [];
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
                              type: SelectMenuDefaultValueType.Role,
                            }
                          : {
                              id: "",
                              type: SelectMenuDefaultValueType.Channel,
                            },
                    );
                    setComponent(component);
                  }}
                >
                  {t("addDefaultValue")}
                </Button>
                <Button
                  discordstyle={ButtonStyle.Secondary}
                  onClick={async () => {
                    const flow = component.flow ?? { actions: [] };
                    setEditingFlow({
                      flow,
                      setFlow: (newFlow) => {
                        component.flow = newFlow;
                        setComponent(component);
                      },
                    });
                  }}
                >
                  {t("editFlow")}
                </Button>
              </div>
            </>
          )}
        </>
      )
    )}
    {submit && (
      <div className="w-full flex mt-4">
        <Button
          className="mx-auto"
          onClick={async ({ currentTarget }) => {
            currentTarget.disabled = true;
            await submit(component, setError);
            currentTarget.disabled = false;
          }}
        >
          {t("save")}
        </Button>
      </div>
    )}
  </div>
);

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
  const { component, setComponent, submit, cache, setEditingFlow } = props;
  const [error, setError] = useError();

  return (
    <Modal title={t("editComponent")} {...props}>
      {error}
      {!submit && !cache && (
        <InfoBox icon="User_02" collapsible>
          {t("componentsNotLoggedIn")}
        </InfoBox>
      )}
      {component && setComponent && (
        <div className="-mt-2">
          <ComponentEditForm
            t={t}
            component={component}
            setComponent={setComponent}
            submit={submit}
            cache={cache}
            setEditingFlow={setEditingFlow}
            setError={setError}
          />
        </div>
      )}
    </Modal>
  );
};

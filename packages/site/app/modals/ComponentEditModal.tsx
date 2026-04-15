import { Collapsible } from "@base-ui-components/react/collapsible";
import { Link } from "@remix-run/react";
import {
  type APISelectMenuOption,
  type APIStringSelectComponent,
  ButtonStyle,
  ComponentType,
  SelectMenuDefaultValueType,
} from "discord-api-types/v10";
import type React from "react";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin, twMerge } from "tailwind-merge";
import { apiUrl, BRoutes } from "~/api/routing";
import type {
  ComponentFoundBackup,
  ComponentFoundBackupHook,
} from "~/api/v1/components.$id.backups";
import { getComponentId } from "~/api/v1/log.webhooks.$webhookId.$webhookToken.messages.$messageId";
import { Checkbox } from "~/components/Checkbox";
import { collapsibleStyles } from "~/components/collapsible";
import { PopoutEmojiPicker } from "~/components/editor/EmojiPicker";
import { type SetErrorFunction, useError } from "~/components/Error";
import { InfoBox } from "~/components/InfoBox";
import type { TFunction } from "~/types/i18next";
import type {
  APIButtonComponent,
  APIComponentInMessageActionRow,
} from "~/types/QueryData";
import type { CacheManager } from "~/util/cache/CacheManager";
import { isSnowflakeSafe } from "~/util/discord";
import { useSafeFetcher } from "~/util/loader";
import { randomString } from "~/util/text";
import { Button } from "../components/Button";
import { CoolIcon } from "../components/icons/CoolIcon";
import { linkClassName } from "../components/preview/Markdown";
import { StringSelect } from "../components/StringSelect";
import { TextInput } from "../components/TextInput";
import { type EditingFlowData, FlowEditModal } from "./FlowEditModal";
import { Modal, type ModalProps, PlainModalHeader } from "./Modal";

export type EditingComponentData = {
  component: APIComponentInMessageActionRow;
  setComponent: (component: APIComponentInMessageActionRow) => void;
  submit: (
    component: APIComponentInMessageActionRow,
    setError?: SetErrorFunction,
  ) => Promise<APIComponentInMessageActionRow>;
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
              const cloned = structuredClone(option);
              cloned.value = randomString(10);
              component.options.splice(index + 1, 0, cloned);
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
  openFoundBackupsWarning,
}: Omit<EditingComponentData, "submit"> &
  Partial<Pick<EditingComponentData, "submit">> & {
    t: TFunction;
    cache?: CacheManager;
    setEditingFlow: React.Dispatch<
      React.SetStateAction<EditingFlowData | undefined>
    >;
    setError?: SetErrorFunction;
    openFoundBackupsWarning?: () => void;
  }) => {
  const backupsWarningButton = openFoundBackupsWarning ? (
    <button
      type="button"
      className={twJoin(
        "text-start group/btn",
        "flex items-center rounded-md px-2 py-1",
        "text-sm text-yellow-600 dark:text-yellow-100",
      )}
      onClick={() => openFoundBackupsWarning()}
    >
      <CoolIcon icon="Triangle_Warning" className="me-1" />
      <p className="group-hover/btn:underline">
        {t("componentBackupsFound.warning", {
          count:
            "flows" in component
              ? Object.keys(component.flows ?? {}).length
              : 1,
        })}
      </p>
    </button>
  ) : null;
  return (
    <div>
      {component.type === ComponentType.Button ? (
        <>
          <div className="flex items-center gap-2">
            <div>
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
            <div className="mt-4.5">
              <Checkbox
                label={t("disabled")}
                checked={component.disabled ?? false}
                onCheckedChange={(checked) => {
                  component.disabled = checked;
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
                        key="0"
                        to="/guide/getting-started/flows"
                        target="_blank"
                        className={twJoin(linkClassName, "cursor-pointer")}
                      />,
                    ]}
                  />
                </p>
                <div className="flex gap-1.5 items-center">
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
                  {backupsWarningButton}
                </div>
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
            <div className="flex items-center gap-2">
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
              <div className="mt-4.5">
                <Checkbox
                  label={t("disabled")}
                  checked={component.disabled ?? false}
                  onCheckedChange={(checked) => {
                    component.disabled = checked;
                    setComponent(component);
                  }}
                />
              </div>
            </div>
            {component.type === ComponentType.StringSelect ? (
              <>
                <div
                  className={twMerge(
                    component.options.length === 0 ? undefined : "-mb-2 pt-2",
                    backupsWarningButton ? "pt-1.5" : undefined,
                  )}
                >
                  {backupsWarningButton ? (
                    <div className="mb-1">{backupsWarningButton}</div>
                  ) : null}
                  {component.options.map((option, oi) => (
                    <SelectMenuOptionsSection
                      key={`component-${component.type}-option-${oi}`}
                      option={option}
                      index={oi}
                      component={component}
                      update={() => setComponent(component)}
                    >
                      <div className="flex items-center gap-2">
                        <div>
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
                        <div className="mt-4.5">
                          <Checkbox
                            label={t("default")}
                            checked={option.default ?? false}
                            onCheckedChange={(checked) => {
                              option.default = checked;
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
                          option.description =
                            e.currentTarget.value || undefined;
                          setComponent(component);
                        }}
                      />
                      <div className="flex">
                        <div className="grow">
                          <TextInput
                            label={t("valueHidden")}
                            className="w-full text-muted dark:text-muted-dark focus:text-current font-code"
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
                          className="mt-auto ms-2 h-9"
                          onClick={async () => {
                            const flows = component.flows ?? {};
                            let flow: (typeof flows)[string] | undefined =
                              flows[option.value];

                            if (!flow) {
                              flow = { actions: [] };
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
                              pattern="^\d{17,23}$"
                              onChange={(e) => {
                                value.id = e.currentTarget.value;
                                setComponent(component);
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
                                  setComponent(component);
                                }}
                              />
                            </div>
                          )}
                          <div className="ltr:ml-2 rtl:mr-2 mt-auto">
                            <Button
                              discordstyle={ButtonStyle.Danger}
                              className="h-9"
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
                  {backupsWarningButton}
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
};

const FoundBackupsResolveModal = ({
  backups,
  unlinkId,
  component,
  ...props
}: ModalProps & {
  component: { type: ComponentType } | undefined;
  backups: ComponentFoundBackup[];
  unlinkId: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <Modal {...props}>
      <PlainModalHeader onClose={() => props.setOpen(false)}>
        {t("componentBackupsFound.modalTitle", {
          replace: { type: component?.type ?? ComponentType.Button },
        })}
      </PlainModalHeader>
      <p>{t("componentBackupsFound.modalDescription")}</p>
      <Collapsible.Root className={twJoin(collapsibleStyles.root, "mt-2")}>
        <Collapsible.Trigger className={collapsibleStyles.trigger}>
          <CoolIcon
            icon="Chevron_Right"
            rtl="Chevron_Left"
            className="block group-data-[panel-open]/trigger:rotate-90 group-data-[panel-open]/trigger:rtl:-rotate-90 transition"
          />
          {t("componentBackupsFound.modalList", { count: backups.length })}
        </Collapsible.Trigger>
        <Collapsible.Panel className={collapsibleStyles.panel}>
          <ul className="list-disc list-inside">
            {backups.map((backup) => (
              <li key={backup.id}>
                <Link
                  className={linkClassName}
                  to={`/?backup=${backup.id}`}
                  target="_blank"
                >
                  {backup.name ?? `ID ${backup.id} (missing access)`}
                </Link>
                {backup.message.total <= 1 ? null : backup.message.name ? (
                  <span> ("{backup.message.name}")</span>
                ) : (
                  <span>
                    {" "}
                    (
                    {t("messageN", {
                      replace: { n: backup.message.index + 1 },
                    })}
                    )
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Collapsible.Panel>
      </Collapsible.Root>
      <p className="mt-2 text-sm text-muted dark:text-muted-dark">
        {t("componentBackupsFound.modalUnlinkNote")}
      </p>
      <div className="w-full flex mt-1 gap-x-3">
        <Button discordstyle={ButtonStyle.Primary} onClick={() => unlinkId()}>
          {t("unlink")}
        </Button>
        <button
          type="button"
          className={linkClassName}
          onClick={() => props.setOpen(false)}
        >
          {t("ignore")}
        </button>
      </div>
    </Modal>
  );
};

export const ComponentEditModal = ({
  component,
  setComponent,
  componentFoundBackupsHook,
  submit,
  cache,
  guildId,
  isPremium,
  ...props
}: ModalProps &
  Partial<EditingComponentData> & {
    componentFoundBackupsHook: ComponentFoundBackupHook;
    cache?: CacheManager;
    guildId?: string;
    isPremium?: boolean;
  }) => {
  const { t } = useTranslation();
  const [error, setError] = useError();
  const [editingFlow, setEditingFlow] = useState<EditingFlowData>();

  const foundBackupsFetcher = useSafeFetcher<ComponentFoundBackup[]>({});
  const componentId = component ? getComponentId(component) : undefined;
  const foundBackups =
    componentId === undefined
      ? []
      : (componentFoundBackupsHook[0][String(componentId)] ?? []);

  useEffect(() => {
    if (!component) return;
    const componentId = getComponentId(component);
    if (componentId !== undefined) {
      const cached = componentFoundBackupsHook[0][String(componentId)];
      if (cached !== undefined) return;

      foundBackupsFetcher
        .loadAsync(apiUrl(BRoutes.componentBackups(String(componentId))))
        .then((backups) => {
          componentFoundBackupsHook[1]({
            action: "add",
            id: String(componentId),
            value: backups,
          });
        });
    }
  }, [component, componentFoundBackupsHook]);
  const [foundBackupsWarningOpen, setFoundBackupsWarningOpen] = useState(false);

  return (
    <Modal {...props}>
      <PlainModalHeader onClose={() => props.setOpen(false)}>
        {t("editComponent")}
      </PlainModalHeader>
      {error}
      {!submit && !cache && (
        <InfoBox icon="User_02" collapsible>
          {t("componentsNotLoggedIn")}
        </InfoBox>
      )}
      <FlowEditModal
        open={!!editingFlow}
        setOpen={() => setEditingFlow(undefined)}
        guildId={guildId}
        {...editingFlow}
        cache={cache}
        premium={isPremium}
        parentContext={component ? `component.${component.type}` : undefined}
      />
      <FoundBackupsResolveModal
        open={foundBackupsWarningOpen && !!component}
        setOpen={setFoundBackupsWarningOpen}
        component={component}
        backups={foundBackups}
        unlinkId={() => {
          if (
            component &&
            setComponent &&
            "custom_id" in component &&
            component.custom_id !== undefined &&
            componentId !== undefined
          ) {
            setComponent({ ...component, custom_id: "" });
            componentFoundBackupsHook[1]({
              action: "add",
              id: String(componentId),
              value: [],
            });
            setFoundBackupsWarningOpen(false);
          }
        }}
      />
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
            openFoundBackupsWarning={
              foundBackups.length === 0
                ? undefined
                : () => setFoundBackupsWarningOpen(true)
            }
          />
        </div>
      )}
    </Modal>
  );
};

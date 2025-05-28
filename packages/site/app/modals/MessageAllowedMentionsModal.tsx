import { Collapsible } from "@base-ui-components/react/collapsible";
import { Switch } from "@base-ui-components/react/switch";
import {
  APIAllowedMentions,
  AllowedMentionsTypes,
} from "discord-api-types/v10";
import type { TFunction } from "i18next";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { Button } from "~/components/Button";
import { BigCheckbox, Checkbox } from "~/components/Checkbox";
import { TextInput } from "~/components/TextInput";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { codeStyle } from "~/components/preview/Markdown";
import { switchStyles } from "~/components/switch";
import { getQdMessageId } from "~/routes/_index";
import { QueryData } from "~/types/QueryData";
import { CacheManager } from "~/util/cache/CacheManager";
import { Modal, ModalFooter, ModalProps, PlainModalHeader } from "./Modal";

interface MessageAllowedMentionsModalProps {
  data: QueryData;
  setData: React.Dispatch<QueryData>;
  cache?: CacheManager;
  messageIndex?: number;
}

// https://github.com/mui/base-ui/blob/master/packages/react/src/utils/usePanelResize.ts
const setAutoSize = (panel: HTMLElement) => {
  const originalHeight = panel.style.height;
  const originalWidth = panel.style.width;
  panel.style.height = "auto";
  panel.style.width = "auto";
  return () => {
    panel.style.height = originalHeight;
    panel.style.width = originalWidth;
  };
};

const recalculatePanelSize = (ref: React.RefObject<HTMLDivElement | null>) => {
  const panel = ref.current;
  // it's pretty safe to assume the panel is open because the user wouldn't be
  // able to call this function otherwise, but let's check just in case
  if (!panel || panel.dataset.open === undefined) return;

  const cleanup = setAutoSize(panel);
  const scrollHeight = panel.scrollHeight;
  const scrollWidth = panel.scrollWidth;
  cleanup();

  panel.style.setProperty("--collapsible-panel-height", `${scrollHeight}px`);
  panel.style.setProperty("--collapsible-panel-width", `${scrollWidth}px`);
};

const collapsibleStyles = {
  root: "rounded-lg py-2 px-3 bg-gray-200 dark:bg-gray-800",
  trigger: "group/trigger flex items-center gap-2 w-full",
  panel: twJoin(
    "flex flex-col justify-end",
    "overflow-hidden transition-all",
    "h-[--collapsible-panel-height] data-[starting-style]:h-0 data-[ending-style]:h-0",
    "space-y-2",
  ),
};

const Inner: React.FC<
  Omit<MessageAllowedMentionsModalProps, "messageIndex"> & {
    t: TFunction;
    message: QueryData["messages"][number];
  }
> = ({ t, data, setData, message, cache }) => {
  const mid = getQdMessageId(message);
  const keyPrefix = `allowed-mentions-${mid}`;

  const userPanelRef = useRef<HTMLDivElement>(null);
  const rolePanelRef = useRef<HTMLDivElement>(null);

  const update = (newAm: APIAllowedMentions) => {
    message.data.allowed_mentions = newAm;
    if (Object.keys(newAm).length === 0) {
      // let discord assume default behavior if we
      // aren't specifying anything
      message.data.allowed_mentions = undefined;
    }
    setData({ ...data });
  };

  const am = useMemo(
    () => message.data.allowed_mentions ?? {},
    [message.data.allowed_mentions],
  );

  // resize panels to fit content in case an allowed_mentions update changed
  // their vertical height
  // biome-ignore lint/correctness/useExhaustiveDependencies: ^
  useEffect(() => {
    recalculatePanelSize(userPanelRef);
    recalculatePanelSize(rolePanelRef);
  }, [message.data.allowed_mentions]);

  return (
    <>
      <div className="space-y-1">
        <div className="flex items-center">
          <label
            htmlFor={`${keyPrefix}-switch`}
            className="cursor-pointer select-none grow"
          >
            {t("enableAllowedMentions")}
          </label>
          <Switch.Root
            id={`${keyPrefix}-switch`}
            className={switchStyles.root}
            checked={!!message.data.allowed_mentions}
            onCheckedChange={(checked) => {
              if (checked) {
                update({ parse: [] });
              } else {
                update({});
              }
            }}
          >
            <Switch.Thumb className={switchStyles.thumb} />
          </Switch.Root>
        </div>
        <p className="text-muted dark:text-muted-dark text-sm">
          {t("allowedMentionsNote")}
        </p>
      </div>
      <hr className="border border-gray-500/20" />
      <div
        className={twJoin(
          "space-y-2 transition-opacity",
          !message.data.allowed_mentions
            ? "opacity-60 cursor-not-allowed pointer-events-none"
            : "opacity-100",
        )}
      >
        <BigCheckbox
          label={t("allowedMentionsProps.mentionEveryone")}
          checked={am.parse?.includes(AllowedMentionsTypes.Everyone) ?? false}
          disabled={!message.data.allowed_mentions}
          onChange={({ currentTarget }) => {
            if (currentTarget.checked) {
              if (am.parse?.includes(AllowedMentionsTypes.Everyone)) {
                return;
              }
              update({
                ...am,
                parse: [...(am.parse ?? []), AllowedMentionsTypes.Everyone],
              });
            } else {
              if (!am.parse) return;
              update({
                ...am,
                parse: am.parse.filter(
                  (p) => p !== AllowedMentionsTypes.Everyone,
                ),
              });
            }
          }}
        />
        <Collapsible.Root className={collapsibleStyles.root}>
          <Collapsible.Trigger className={collapsibleStyles.trigger}>
            <CoolIcon
              icon="Chevron_Right"
              className="block group-data-[panel-open]/trigger:rotate-90 transition text-2xl"
            />
            <span className="text-base font-medium">Users</span>
          </Collapsible.Trigger>
          <Collapsible.Panel
            ref={userPanelRef}
            className={collapsibleStyles.panel}
          >
            <div className="space-y-1">
              <div className="flex items-center">
                <label
                  htmlFor={`${keyPrefix}-switch-users`}
                  className="cursor-pointer select-none grow"
                >
                  {t("allowedMentionsProps.automatic")}
                </label>
                <Switch.Root
                  id={`${keyPrefix}-switch-users`}
                  className={switchStyles.root}
                  checked={
                    am.parse?.includes(AllowedMentionsTypes.User) ?? false
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      update({
                        ...am,
                        // remove IDs, if any, otherwise the payload is invalid
                        users: [],
                        // add if necessary
                        parse: !am.parse?.includes(AllowedMentionsTypes.User)
                          ? [...(am.parse ?? []), AllowedMentionsTypes.User]
                          : am.parse,
                      });
                    } else {
                      update({
                        ...am,
                        // remove if necessary
                        parse: am.parse?.filter(
                          (p) => p !== AllowedMentionsTypes.User,
                        ),
                      });
                    }
                  }}
                >
                  <Switch.Thumb className={switchStyles.thumb} />
                </Switch.Root>
              </div>
              <p className="text-muted dark:text-muted-dark text-sm">
                {t("allowedMentionsProps.automaticUsersNote")}
              </p>
            </div>
            <div>
              <p>Manual</p>
              <div className="space-y-1">
                {cache
                  ? cache.member.getAll().map(({ user }) => (
                      <div key={`${keyPrefix}-users-cache-${user.id}`}>
                        <Checkbox
                          label={
                            <span className="flex items-center gap-2">
                              <span>{user.global_name ?? user.username}</span>
                              {user.global_name &&
                              user.global_name !== user.username ? (
                                <span className="text-muted dark:text-muted-dark text-xs">
                                  {user.username}
                                </span>
                              ) : null}
                            </span>
                          }
                          checked={am.users?.includes(user.id) ?? false}
                          onCheckedChange={(checked) => {
                            const users = am.users ?? [];
                            if (checked && !users.includes(user.id)) {
                              users.push(user.id);
                              am.users = users;
                            } else if (!checked) {
                              am.users = users.filter((uid) => uid !== user.id);
                            }

                            if (am.parse?.includes(AllowedMentionsTypes.User)) {
                              am.parse = am.parse.filter(
                                (p) => p !== AllowedMentionsTypes.User,
                              );
                            }

                            update({ ...am });
                          }}
                        />
                      </div>
                    ))
                  : null}
                {!!am.users && am.users.length > 0
                  ? am.users
                      // don't bother to resolve when the mention isn't even
                      // actually in the message
                      .filter((userId) => !cache?.member.get(userId))
                      .map((userId) => {
                        return (
                          <div
                            key={`${keyPrefix}-users-${userId}`}
                            className="text-sm flex items-center gap-2"
                          >
                            <button
                              type="button"
                              className="w-6 h-6 flex group/button"
                              onClick={() => {
                                if (am.users?.includes(userId)) {
                                  am.users = am.users?.filter(
                                    (uid) => uid !== userId,
                                  );
                                  update({ ...am });
                                }
                              }}
                            >
                              <CoolIcon
                                icon="Trash_Full"
                                className="text-xl mx-auto -mt-[2px] group-hover/button:text-red-400 transition"
                              />
                            </button>
                            <p>
                              <code className={codeStyle}>{userId}</code>
                            </p>
                          </div>
                        );
                      })
                  : null}
                <form
                  className="flex gap-2 w-full"
                  onSubmit={(e) => {
                    e.preventDefault();

                    const value = new FormData(e.currentTarget).get("id");
                    if (!value || typeof value !== "string") return;

                    if (am.parse?.includes(AllowedMentionsTypes.User)) {
                      am.parse = am.parse.filter(
                        (p) => p !== AllowedMentionsTypes.User,
                      );
                    }
                    if (!am.users?.includes(value)) {
                      // add ID if necessary
                      am.users = am.users ?? [];
                      am.users.push(value);
                      update({ ...am });
                    }

                    e.currentTarget.reset();
                  }}
                >
                  <div className="grow">
                    <TextInput
                      name="id"
                      placeholder="User ID"
                      className="w-full h-8 min-h-0 text-sm"
                    />
                  </div>
                  <Button type="submit" className="self-end text-sm">
                    {t("add")}
                  </Button>
                </form>
              </div>
            </div>
          </Collapsible.Panel>
        </Collapsible.Root>
        <Collapsible.Root className={collapsibleStyles.root}>
          <Collapsible.Trigger className={collapsibleStyles.trigger}>
            <CoolIcon
              icon="Chevron_Right"
              className="block group-data-[panel-open]/trigger:rotate-90 transition text-2xl"
            />
            <span className="text-base font-medium">Roles</span>
          </Collapsible.Trigger>
          <Collapsible.Panel
            ref={rolePanelRef}
            className={collapsibleStyles.panel}
          >
            <div className="space-y-1">
              <div className="flex items-center">
                <label
                  htmlFor={`${keyPrefix}-switch-roles`}
                  className="cursor-pointer select-none grow"
                >
                  {t("allowedMentionsProps.automatic")}
                </label>
                <Switch.Root
                  id={`${keyPrefix}-switch-roles`}
                  className={switchStyles.root}
                  checked={
                    am.parse?.includes(AllowedMentionsTypes.Role) ?? false
                  }
                  onCheckedChange={(checked) => {
                    if (checked) {
                      update({
                        ...am,
                        // remove IDs, if any, otherwise the payload is invalid
                        roles: [],
                        // add if necessary
                        parse: !am.parse?.includes(AllowedMentionsTypes.Role)
                          ? [...(am.parse ?? []), AllowedMentionsTypes.Role]
                          : am.parse,
                      });
                    } else {
                      update({
                        ...am,
                        // remove if necessary
                        parse: am.parse?.filter(
                          (p) => p !== AllowedMentionsTypes.Role,
                        ),
                      });
                    }
                  }}
                >
                  <Switch.Thumb className={switchStyles.thumb} />
                </Switch.Root>
              </div>
              <p className="text-muted dark:text-muted-dark text-sm">
                {t("allowedMentionsProps.automaticRolesNote")}
              </p>
            </div>
            <div>
              <p>Manual</p>
              <div className="space-y-1">
                {cache
                  ? cache.role.getAll().map((role) => (
                      <div key={`${keyPrefix}-roles-cache-${role.id}`}>
                        <Checkbox
                          label={
                            <span className="flex items-center gap-2">
                              <span>{role.name}</span>
                            </span>
                          }
                          checked={am.roles?.includes(role.id) ?? false}
                          onCheckedChange={(checked) => {
                            const roles = am.roles ?? [];
                            if (checked && !roles.includes(role.id)) {
                              roles.push(role.id);
                              am.roles = roles;
                            } else if (!checked) {
                              am.roles = roles.filter((uid) => uid !== role.id);
                            }

                            if (am.parse?.includes(AllowedMentionsTypes.Role)) {
                              am.parse = am.parse.filter(
                                (p) => p !== AllowedMentionsTypes.Role,
                              );
                            }

                            update({ ...am });
                          }}
                        />
                      </div>
                    ))
                  : null}
                {!!am.roles && am.roles.length > 0
                  ? am.roles
                      // don't bother to resolve when the mention isn't even
                      // actually in the message
                      .filter((roleId) => !cache?.role.get(roleId))
                      .map((roleId) => {
                        return (
                          <div
                            key={`${keyPrefix}-roles-${roleId}`}
                            className="text-sm flex items-center gap-2"
                          >
                            <button
                              type="button"
                              className="w-6 h-6 flex group/button"
                              onClick={() => {
                                if (am.roles?.includes(roleId)) {
                                  am.roles = am.roles?.filter(
                                    (uid) => uid !== roleId,
                                  );
                                  update({ ...am });
                                }
                              }}
                            >
                              <CoolIcon
                                icon="Trash_Full"
                                className="text-xl mx-auto -mt-[2px] group-hover/button:text-red-400 transition"
                              />
                            </button>
                            <p>
                              <code className={codeStyle}>{roleId}</code>
                            </p>
                          </div>
                        );
                      })
                  : null}
                <form
                  className="flex gap-2 w-full"
                  onSubmit={(e) => {
                    e.preventDefault();

                    const value = new FormData(e.currentTarget).get("id");
                    if (!value || typeof value !== "string") return;

                    if (am.parse?.includes(AllowedMentionsTypes.Role)) {
                      am.parse = am.parse.filter(
                        (p) => p !== AllowedMentionsTypes.Role,
                      );
                    }
                    if (!am.roles?.includes(value)) {
                      // add ID if necessary
                      am.roles = am.roles ?? [];
                      am.roles.push(value);
                      update({ ...am });
                    }

                    e.currentTarget.reset();
                  }}
                >
                  <div className="grow">
                    <TextInput
                      name="id"
                      placeholder="Role ID"
                      className="w-full h-8 min-h-0 text-sm"
                    />
                  </div>
                  <Button type="submit" className="self-end text-sm">
                    {t("add")}
                  </Button>
                </form>
              </div>
            </div>
          </Collapsible.Panel>
        </Collapsible.Root>
      </div>
    </>
  );
};

export const MessageAllowedMentionsModal = (
  props: ModalProps & MessageAllowedMentionsModalProps,
) => {
  const { t } = useTranslation();
  const { data, messageIndex } = props;
  const message =
    messageIndex !== undefined ? data.messages[messageIndex] : undefined;

  return (
    <Modal {...props}>
      <PlainModalHeader>{t("allowedMentions")}</PlainModalHeader>
      <div className="space-y-2">
        {message && messageIndex !== undefined ? (
          <Inner
            t={t}
            data={data}
            setData={props.setData}
            message={message}
            cache={props.cache}
          />
        ) : null}
        <ModalFooter className="flex gap-2 flex-wrap">
          <Button
            className="ltr:ml-auto rtl:mr-auto"
            onClick={() => props.setOpen(false)}
          >
            {t("ok")}
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
};

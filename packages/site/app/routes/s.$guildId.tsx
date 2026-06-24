import { Avatar } from "@base-ui/react/avatar";
import { Collapsible } from "@base-ui/react/collapsible";
import { Field } from "@base-ui/react/field";
import { REST } from "@discordjs/rest";
import {
  json,
  type MetaFunction,
  redirect,
  type SerializeFrom,
} from "@remix-run/cloudflare";
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import {
  type APIGuild,
  type APIGuildMember,
  type APIUser,
  ButtonStyle,
  ComponentType,
  RESTJSONErrorCodes,
  UserFlags,
  WebhookType,
} from "discord-api-types/v10";
import {
  type BitFlagResolvable,
  PermissionFlags,
  PermissionsBitField,
  UserFlagsBitField,
} from "discord-bitflag";
import { getDate } from "discord-snowflake";
import { useEffect, useMemo, useReducer, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twJoin, twMerge } from "tailwind-merge";
import { z } from "zod/v3";
import { apiUrl, BRoutes } from "~/api/routing";
import { Button } from "~/components/Button";
import { ChannelSelect } from "~/components/ChannelSelect";
import { Checkbox } from "~/components/Checkbox";
import { collapsibleStyles } from "~/components/collapsible";
import { getComponentWidth } from "~/components/editor/TopLevelComponentEditor";
import { useError } from "~/components/Error";
import { Header } from "~/components/Header";
import { PostChannelIcon } from "~/components/icons/channel";
import { CoolIcon, type CoolIconsGlyph } from "~/components/icons/CoolIcon";
import { CrownIcon, PeopleIcon, RoleShield } from "~/components/icons/role";
import { GenericPreviewComponentInActionRow } from "~/components/preview/ActionRow";
import {
  actionableMentionStyle,
  codeStyle,
  type FeatureConfig,
  linkClassName,
  Markdown,
} from "~/components/preview/Markdown";
import { UsernameBadge } from "~/components/preview/Message.client";
import { Prose } from "~/components/Prose";
import { TabHeader, TabsWindow } from "~/components/tabs";
import { TextArea } from "~/components/TextArea";
import { TextInput } from "~/components/TextInput";
import { type ConfirmModalProps, useConfirmModal } from "~/modals/ConfirmModal";
import { FlowEditModal } from "~/modals/FlowEditModal";
import type { Target } from "~/modals/MessageSendModal";
import { TriggerCreateModal } from "~/modals/TriggerCreateModal";
import { TargetEditModal } from "~/modals/WebhookEditModal";
import {
  authorizeRequest,
  getGuild,
  getTokenGuildPermissions,
  User,
} from "~/session.server";
import type { DraftFlow } from "~/store.server";
import type { TFunction } from "~/types/i18next";
import { TargetType } from "~/types/QueryData-raw";
import {
  type CacheManager,
  ResolvableAPIGuildMember,
  useCache,
} from "~/util/cache/CacheManager";
import {
  cdn,
  cdnImgAttributes,
  injectErrorContext,
  isDiscordError,
  webhookAvatarUrl,
} from "~/util/discord";
import { getId } from "~/util/id";
import {
  type LoaderArgs,
  type SafeFetcher,
  useSafeFetcher,
} from "~/util/loader";
import { copyText } from "~/util/text";
import { getUserAvatar, userIsPremium } from "~/util/users";
import { zxParseParams } from "~/util/zod";
import type { action as ApiComponentAction } from "../api/v1/components.$id";
import type { loader as ApiGetGuildComponents } from "../api/v1/guilds.$guildId.components";
import type { loader as ApiGetGuildAuditLog } from "../api/v1/guilds.$guildId.log";
import type { loader as ApiGetGuildProfile } from "../api/v1/guilds.$guildId.profile";
import type { loader as ApiGetGuildSessions } from "../api/v1/guilds.$guildId.sessions";
import type { action as ApiPutGuildTriggerEvent } from "../api/v1/guilds.$guildId.trigger-events.$event";
import type { loader as ApiGetGuildTriggers } from "../api/v1/guilds.$guildId.triggers";
import type { action as ApiPatchGuildTrigger } from "../api/v1/guilds.$guildId.triggers.$triggerId";
import type { loader as ApiGetGuildWebhooks } from "../api/v1/guilds.$guildId.webhooks";
import type { action as ApiPatchGuildWebhook } from "../api/v1/guilds.$guildId.webhooks.$webhookId";
import { Cell } from "./donate";
import { buildStorableComponent } from "./edit.component.$id";

export const loader = async ({ request, context, params }: LoaderArgs) => {
  const { guildId } = zxParseParams(params, {
    guildId: z.string().refine((v) => !Number.isNaN(Number(v))),
  });
  const [token, respond] = await authorizeRequest(request, context);
  let owner: boolean | undefined;
  let permissions: PermissionsBitField;
  let guild: APIGuild | undefined;
  try {
    ({ owner, permissions, guild } = await getTokenGuildPermissions(
      token,
      guildId,
      context.env,
    ));
    if (!guild) {
      guild = await getGuild(
        guildId,
        new REST().setToken(context.env.DISCORD_BOT_TOKEN),
        context.env,
      );
      owner = guild.owner_id === String(token.user.discordId);
    }
  } catch (e) {
    if (isDiscordError(e)) {
      if (e.code === RESTJSONErrorCodes.UnknownGuild) {
        throw redirect(`/bot?guildId=${guildId}`);
      }
      throw respond(
        json(injectErrorContext(e.rawError, { guildId }), e.status),
      );
    } else if (e instanceof Response && e.status === 404) {
      // Making assumptions here
      throw redirect(`/bot?guildId=${guildId}`);
    }
    throw e;
  }

  return respond(
    json({
      guild: {
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
      },
      user: token.user,
      member: {
        owner,
        permissions: permissions.toString(),
      },
      discordApplicationId: context.env.DISCORD_CLIENT_ID,
    }),
  );
};

export const meta: MetaFunction = ({ data }) => {
  if (data) {
    const { guild } = data as SerializeFrom<typeof loader>;
    return [
      { title: `${guild.name} - Discohook` },
      { name: "apple-mobile-web-app-title", content: guild.name },
      ...(guild.icon
        ? [
            {
              tagName: "link",
              rel: "icon",
              type: guild.icon.startsWith("a_") ? "image/gif" : "image/webp",
              href: cdn.icon(guild.id, guild.icon, {
                size: 16,
                extension: guild.icon.startsWith("a_") ? "gif" : "webp",
              }),
            },
            {
              // we can't exactly match apple's sizes with the discord cdn
              // so we're just going to provide one unsized icon.
              tagName: "link",
              rel: "apple-touch-icon",
              href: cdn.icon(guild.id, guild.icon, {
                size: 256,
                extension: "png",
              }),
            },
          ]
        : []),
    ];
  }
  return [];
};

const tabValues = [
  "home",
  "auditLog",
  "webhooks",
  "sessions",
  "triggers",
  "components",
  "profile",
] as const;

type Tab = (typeof tabValues)[number];

const flowEventsDetails: Record<number, { icon: CoolIconsGlyph }> = {
  0: { icon: "User_Add" },
  1: { icon: "User_Remove" },
};

const bioMarkdownFeatures: FeatureConfig = {
  paragraphs: true,
  breaks: true,
  text: true,
  customEmojis: true,
  unicodeEmojis: true,
  autoLinks: true,
  italic: true,
  bold: true,
  underline: true,
  strikethrough: true,
  channelMentions: true,
  guildSectionMentions: true,
  commandMentions: true, // sort of? they are parsed but not clickable
  blockQuotes: true,
  inlineCode: true, // block code is sort of supported but not properly
  spoilers: true,
  timestamps: true,
};

export const ProfilePreview = ({
  t,
  user,
  member,
  avatarURL: overrideAvatarURL,
  bannerURL: overrideBannerURL,
  cache,
  setAvatarObjectURL,
  setBannerObjectURL,
}: {
  t: TFunction;
  user: Pick<
    APIUser,
    | "id"
    | "username"
    | "global_name"
    | "discriminator"
    | "avatar"
    | "banner"
    | "bot"
    | "public_flags"
  >;
  member?: Pick<APIGuildMember, "nick" | "avatar" | "banner"> & {
    guild_id: string;
    bio?: string | null;
  };
  avatarURL?: string;
  bannerURL?: string;
  cache?: CacheManager;
  setAvatarObjectURL?: (url: string | null) => void;
  setBannerObjectURL?: (url: string | null) => void;
}) => {
  const flags = new UserFlagsBitField(BigInt(user.public_flags ?? 0));

  const bannerURL =
    overrideBannerURL ??
    (member?.banner
      ? cdn.guildMemberBanner(member.guild_id, user.id, member.banner, {
          size: 512,
        })
      : user.banner
        ? cdn.banner(user.id, user.banner)
        : undefined);

  const avatarBorderClassName =
    "box-border border-4 border-white dark:border-gray-800";
  const avatarClassName = twJoin("rounded-full size-20", avatarBorderClassName);
  return (
    <div
      dir="ltr" // discord doesn't support RTL
      className={twJoin(
        "rounded-lg w-64 shadow-lg bg-white dark:bg-gray-800",
        "box-border gap-2 pb-2 flex flex-col overflow-hidden",
        "border border-border-normal dark:border-border-normal-dark",
      )}
    >
      <div
        id="profile-banner"
        className={twJoin(
          "bg-gray-100 dark:bg-gray-900",
          "bg-cover bg-center w-full rounded-t-lg relative",
          bannerURL ? "h-[6.5rem]" : "h-14",
        )}
        style={{
          backgroundImage: bannerURL ? `url(${bannerURL})` : "",
        }}
      >
        {setBannerObjectURL ? (
          <>
            <input
              name="banner"
              hidden
              readOnly
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              onChange={(e) => {
                const files = e.currentTarget.files;
                if (!files) return;

                const file = files[0];
                if (!file.type.startsWith("image/")) {
                  e.currentTarget.value = "";
                  return;
                }

                setBannerObjectURL(URL.createObjectURL(file));
              }}
            />
            <button
              type="button"
              className="absolute inset-0 w-full h-full box-border rounded-t-lg bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
              onClick={() => {
                const el = document.querySelector<HTMLInputElement>(
                  "#profile-banner>input",
                );
                el?.click();
              }}
            />
          </>
        ) : null}
      </div>
      <div className="px-4">
        <div className="flex flex-row">
          {/* Negative top margin should be half of the avatar height */}
          <Avatar.Root id="profile-avatar" className="-mt-10 relative">
            {overrideAvatarURL ? (
              <Avatar.Image
                src={overrideAvatarURL}
                className={twJoin(avatarClassName, "object-cover")}
              />
            ) : member?.avatar ? (
              <Avatar.Image
                {...cdnImgAttributes(128, (size) =>
                  cdn.guildMemberAvatar(
                    member.guild_id,
                    user.id,
                    // biome-ignore lint/style/noNonNullAssertion: above
                    member.avatar!,
                    { size },
                  ),
                )}
                className={avatarClassName}
              />
            ) : user.avatar ? (
              <Avatar.Image
                {...cdnImgAttributes(128, (size) =>
                  // biome-ignore lint/style/noNonNullAssertion: above
                  cdn.avatar(user.id, user.avatar!, { size }),
                )}
                className={avatarClassName}
              />
            ) : null}
            <Avatar.Fallback>
              <img
                // force default avatar; it's probably cached
                src={getUserAvatar({
                  discordUser: {
                    id: BigInt(user.id),
                    avatar: null,
                    discriminator: user.discriminator,
                  },
                })}
                alt=""
                className={avatarClassName}
              />
            </Avatar.Fallback>
            {setAvatarObjectURL ? (
              <>
                <input
                  name="avatar"
                  hidden
                  readOnly
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  onChange={(e) => {
                    const files = e.currentTarget.files;
                    if (!files) return;

                    const file = files[0];
                    if (!file.type.startsWith("image/")) {
                      e.currentTarget.value = "";
                      return;
                    }

                    setAvatarObjectURL(URL.createObjectURL(file));
                  }}
                />
                <button
                  type="button"
                  className={twJoin(
                    "absolute inset-0 w-full h-full rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity",
                    avatarBorderClassName,
                  )}
                  onClick={() => {
                    const el = document.querySelector<HTMLInputElement>(
                      "#profile-avatar>input",
                    );
                    el?.click();
                  }}
                />
              </>
            ) : null}
          </Avatar.Root>
        </div>
        <div id="profile-name">
          <div className="flex flex-row gap-1">
            <p className="text-xl font-bold leading-[1.2] break-words overflow-y-hidden max-h-[4.5rem]">
              {member?.nick || user.global_name || user.username}
            </p>
            {user.bot ? (
              <UsernameBadge
                label={t("badge.app")}
                verified={flags.has(UserFlags.VerifiedBot)}
                className="self-center"
              />
            ) : null}
          </div>
          <p className="whitespace-normal break-all text-sm font-normal leading-[1.125rem]">
            {user.username}
            {user.discriminator === "0" ? "" : `#${user.discriminator}`}
          </p>
        </div>
        <div id="profile-bio" className="mt-2">
          {member?.bio ? (
            <div className="text-sm [--font-size:0.875rem] whitespace-pre-line">
              <Markdown
                content={member.bio}
                cache={cache}
                features={bioMarkdownFeatures}
              />
            </div>
          ) : (
            <p className="italic text-muted dark:text-muted-dark text-sm leading-5">
              {t(
                member?.bio === "" || member?.bio === null
                  ? "bioDefault"
                  : "bioWriteOnly",
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

interface ProfileFormData {
  nick?: string | null;
  bio?: string | null;
  avatarObjectURL?: string | null;
  bannerObjectURL?: string | null;
  submitBio?: boolean;
  status?: string;
}

const PermissionCircleCheck = ({ check }: { check: boolean }) => (
  <CoolIcon
    className={check ? "text-green-400" : "text-muted dark:text-muted-dark"}
    icon={check ? "Circle_Check" : "Close_Circle"}
  />
);

// const cloneQuery = (
//   current: Record<string, string | number | null | undefined>,
// ) => {
//   const newQuery = new URLSearchParams();
//   for (const [key, value] of Object.entries(current)) {
//     if (value == null) continue;
//     newQuery.set(key, String(value));
//   }
//   return newQuery;
// };

export default () => {
  const { guild, user, member, discordApplicationId } =
    useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const [error, setError] = useError(t);
  const permissions = new PermissionsBitField(BigInt(member.permissions));
  const has = (...flags: BitFlagResolvable[]) =>
    member.owner ? true : permissions.has(...flags);

  const cache = useCache(!user);
  // cache should not actually change
  // biome-ignore lint/correctness/useExhaustiveDependencies: ^
  useEffect(() => {
    cache.fetchGuildCacheable(guild.id);
  }, [guild]);

  const [page, setPage] = useState(1);

  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("t") as Tab | null;
  const [tab, setTab] = useReducer(
    (_: Tab, newTab: Tab) => {
      // reset pagination when navigating to a new tab
      setPage(1);
      return newTab;
    },
    defaultTab && tabValues.includes(defaultTab) ? defaultTab : tabValues[0],
  );

  const [openWebhookId, setOpenWebhookId] = useState<string>();
  const [creatingTrigger, setCreatingTrigger] = useState(false);
  const [confirmModal, setConfirm] = useConfirmModal();

  const auditLogFetcher = useFetcher<typeof ApiGetGuildAuditLog>();
  const webhooksFetcher = useSafeFetcher<typeof ApiGetGuildWebhooks>({
    onError: setError,
  });
  const [webhooksForced, setWebhooksForced] = useState(false);
  const guildWebhookFetcher = useSafeFetcher<typeof ApiPatchGuildWebhook>({
    onError: setError,
  });
  const sessionsFetcher = useSafeFetcher<typeof ApiGetGuildSessions>({
    onError: setError,
  });
  const sessionFetcher = useSafeFetcher({ onError: setError });
  const profileFetcher = useSafeFetcher<typeof ApiGetGuildProfile>({
    onError: setError,
  });
  const componentsFetcher = useSafeFetcher<typeof ApiGetGuildComponents>({
    onError: setError,
  });
  const componentActioner = useSafeFetcher<typeof ApiComponentAction>({
    onError: setError,
  });
  const triggersFetcher = useSafeFetcher<typeof ApiGetGuildTriggers>({
    onError: setError,
  });
  const triggerSaveFetcher = useSafeFetcher<typeof ApiPatchGuildTrigger>({
    onError: setError,
  });
  const triggerEventTestFetcher = useSafeFetcher<
    typeof ApiPutGuildTriggerEvent
  >({
    onError: setError,
  });
  const [openTriggerId, setOpenTriggerId] = useState<bigint>();
  const [editOpenTriggerFlow, setEditOpenTriggerFlow] = useState(false);
  const openTrigger = triggersFetcher.data
    ? triggersFetcher.data.find((t) => t.id === openTriggerId)
    : undefined;

  const [draftFlow, setDraftFlow] = useState<DraftFlow>();
  useEffect(() => {
    if (openTrigger) {
      setDraftFlow(openTrigger.flow ?? { actions: [] });
    } else {
      setDraftFlow(undefined);
      setEditOpenTriggerFlow(false);
    }
  }, [openTrigger]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: A wizard specifies precisely the dependencies he means to.
  useEffect(() => {
    switch (tab) {
      case "auditLog": {
        if (!auditLogFetcher.data && auditLogFetcher.state === "idle") {
          auditLogFetcher.load(apiUrl(BRoutes.guildLog(guild.id)));
        }
        break;
      }
      case "webhooks": {
        if (!webhooksFetcher.data && webhooksFetcher.state === "idle") {
          webhooksFetcher.load(
            `${apiUrl(BRoutes.guildWebhooks(guild.id))}?withInaccessible=true`,
          );
        }
        break;
      }
      case "sessions": {
        if (!sessionsFetcher.data && sessionsFetcher.state === "idle") {
          sessionsFetcher.load(apiUrl(BRoutes.guildSessions(guild.id)));
        }
        break;
      }
      case "triggers": {
        if (!triggersFetcher.data && triggersFetcher.state === "idle") {
          triggersFetcher.load(apiUrl(BRoutes.guildTriggers(guild.id)));
        }
        break;
      }
      case "components": {
        if (!componentsFetcher.data && componentsFetcher.state === "idle") {
          componentsFetcher.load(apiUrl(BRoutes.guildComponents(guild.id)));
        }
        break;
      }
      case "profile": {
        if (!profileFetcher.data && profileFetcher.state === "idle") {
          profileFetcher.load(apiUrl(BRoutes.guildProfile(guild.id)));
        }
        break;
      }
      default:
        break;
    }
  }, [
    tab,
    auditLogFetcher.data,
    auditLogFetcher.state,
    webhooksFetcher.data,
    webhooksFetcher.state,
    sessionsFetcher.data,
    sessionsFetcher.state,
    triggersFetcher.data,
    triggersFetcher.state,
    componentsFetcher.data,
    componentsFetcher.state,
    profileFetcher.data,
    profileFetcher.state,
  ]);

  // Whenever openTriggerId is set but there is no openTrigger (it was just
  // created), refresh list
  // biome-ignore lint/correctness/useExhaustiveDependencies: ^
  useEffect(() => {
    if (openTriggerId && !openTrigger && triggersFetcher.state === "idle") {
      triggersFetcher.load(apiUrl(BRoutes.guildTriggers(guild.id)));
    }
  }, [openTriggerId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: don't run excessively
  useEffect(() => {
    if (
      openWebhookId &&
      guildWebhookFetcher.state === "idle" &&
      guildWebhookFetcher.data
    ) {
      webhooksFetcher.load(
        `${apiUrl(BRoutes.guildWebhooks(guild.id))}?withInaccessible=true`,
      );
    }
  }, [guildWebhookFetcher.state, guildWebhookFetcher.data]);

  const [profileForm, setProfileForm] = useState<ProfileFormData>({});
  useEffect(() => {
    if (profileFetcher.data) {
      setProfileForm({
        nick: profileFetcher.data.nick,
        bio: profileFetcher.data.bio,
        // empty string means it was fetched but is empty, undefined means it
        // was not fetched
        submitBio: profileFetcher.data.bio !== undefined,
        status: "discohook.app/guide",
      });
    }
  }, [profileFetcher.data]);

  // Pre-resolve responsible users to avoid funkiness that I was encountering
  // trying to do it as the modal opens. In most sensibly laid out servers this
  // won't be that many unique users, but it's still not preferable since the
  // user might not even open a menu.
  // biome-ignore lint/correctness/useExhaustiveDependencies: limit refreshes
  useEffect(() => {
    if (componentsFetcher.data) {
      // Skip resolution for current user (though we now omit the nickname)
      const userDiscordId = user.discordUser?.id?.toString();
      if (
        user.discordUser &&
        userDiscordId &&
        !cache.member.get(userDiscordId, guild.id)
      ) {
        cache.member._put(`member:${guild.id}-${userDiscordId}`, {
          nick: null,
          user: {
            id: userDiscordId,
            username: user.discordUser.name,
            global_name: user.discordUser.globalName,
          },
        });
      }

      const requests = new Set<string>();
      for (const component of componentsFetcher.data) {
        if (requests.size >= 20) {
          // Save probably-unnecessary requests. The ID is still visible.
          // TODO: find a way to resolve within the menu so this isn't a problem.
          break;
        }
        if (component.updatedBy?.discordId) {
          requests.add(`member:${guild.id}-${component.updatedBy.discordId}`);
        } else if (component.createdBy?.discordId) {
          requests.add(`member:${guild.id}-${component.createdBy.discordId}`);
        }
      }
      if (requests.size !== 0) {
        cache.resolveMany(requests);
      }
    }
  }, [componentsFetcher.data]);

  // Bulk revoke sessions
  const [selectedSessionIds, setSelectedSessionIds] = useReducer(
    (
      prev: string[],
      state: {
        action: "add" | "remove" | "overwrite";
        value: string | string[];
      },
    ) => {
      const val = Array.isArray(state.value) ? state.value : [state.value];
      if (state.action === "add") {
        return [...prev, ...val];
      } else if (state.action === "overwrite") {
        return val;
      }
      return prev.filter((v) => !val.includes(v));
    },
    [],
  );

  return (
    <div>
      <TargetEditModal
        targets={Object.fromEntries(
          webhooksFetcher.data
            ? webhooksFetcher.data.map((webhook) => [
                `${TargetType.Webhook}:${webhook.id}`,
                {
                  type: TargetType.Webhook,
                  webhook: {
                    type: WebhookType.Incoming,
                    application_id: webhook.applicationId,
                    id: webhook.id,
                    name: webhook.name,
                    avatar: webhook.avatar,
                    channel_id: webhook.channelId,
                  },
                } satisfies Target,
              ])
            : [],
        )}
        updateTargets={() => {}}
        submit={(payload) => {
          if (!openWebhookId) return;
          guildWebhookFetcher.submit(payload, {
            method: "PATCH",
            action: apiUrl(BRoutes.guildWebhook(guild.id, openWebhookId)),
          });
        }}
        channels={cache.channel.getAll()}
        targetKey={`${TargetType.Webhook}:${openWebhookId}`}
        open={!!openWebhookId}
        setOpen={() => setOpenWebhookId(undefined)}
        user={user}
        cache={cache}
      />
      <TriggerCreateModal
        open={creatingTrigger}
        setOpen={setCreatingTrigger}
        guildId={guild.id}
        cache={cache}
        setOpenTriggerId={setOpenTriggerId}
      />
      <FlowEditModal
        open={editOpenTriggerFlow}
        setOpen={setEditOpenTriggerFlow}
        guildId={guild.id}
        flow={draftFlow}
        setFlow={setDraftFlow}
        cache={cache}
        premium={userIsPremium(user)}
      />
      {confirmModal}
      <Header user={user} />
      <Prose>
        {error}
        <TabsWindow
          tab={tab}
          setTab={setTab as (v: string) => void}
          data={[
            { label: t("home"), value: "home" },
            ...(has(PermissionFlags.ManageNicknames)
              ? [{ label: t("profile"), value: "profile" }]
              : []),
            ...(has(PermissionFlags.Administrator)
              ? [{ label: t("sessions"), value: "sessions" }]
              : []),
            ...(has(
              PermissionFlags.ManageMessages,
              PermissionFlags.ManageWebhooks,
            )
              ? [{ label: t("components"), value: "components" }]
              : []),
            ...(has(PermissionFlags.ManageWebhooks)
              ? [{ label: t("webhooks"), value: "webhooks" }]
              : []),
            ...(has(PermissionFlags.ViewAuditLog, PermissionFlags.ManageGuild)
              ? [
                  { label: t("auditLog"), value: "auditLog" },
                  // { label: t("sessions"), value: "sessions" },
                ]
              : []),
            ...(has(PermissionFlags.ManageGuild)
              ? [{ label: t("triggers"), value: "triggers" }]
              : []),
          ]}
        >
          {tab === "home" ? (
            <div>
              <TabHeader>{t("home")}</TabHeader>
              <div className="space-y-2">
                <div className="rounded-lg p-4 bg-gray-100 dark:bg-gray-900">
                  <div className="flex">
                    <img
                      {...cdnImgAttributes(64, (size) =>
                        guild.icon
                          ? cdn.icon(guild.id, guild.icon, { size })
                          : cdn.defaultAvatar(0),
                      )}
                      className="rounded-lg size-12 me-4"
                      alt={guild.name}
                    />
                    <div className="-mt-2">
                      <p className="text-xl font-semibold">{guild.name}</p>
                      <p>
                        <Trans
                          t={t}
                          i18nKey="homeWelcome"
                          components={{
                            narrow: <span className="inline sm:hidden" />,
                            wide: <span className="hidden sm:inline" />,
                          }}
                        />
                      </p>
                    </div>
                  </div>
                  <details className="rounded-lg mt-2 bg-gray-200 dark:bg-gray-800 group">
                    <summary className="flex marker:content-none marker-none cursor-pointer py-2 px-3">
                      <Avatar.Root className="size-10 me-3 my-auto shrink-0">
                        <Avatar.Image
                          {...cdnImgAttributes(64, (size) =>
                            getUserAvatar(user, { size }),
                          )}
                          className="rounded-full size-full"
                          alt={user.name}
                        />
                        <Avatar.Fallback>
                          <img
                            src={getUserAvatar(user, { forceDefault: true })}
                            className="rounded-full size-full"
                            alt=""
                          />
                        </Avatar.Fallback>
                      </Avatar.Root>
                      <p className="font-medium my-auto me-2">
                        {t(
                          `homePermission.${
                            member.owner
                              ? "owner"
                              : has(PermissionFlags.Administrator)
                                ? "admin"
                                : "roles"
                          }`,
                        )}
                      </p>
                      <CoolIcon
                        icon="Chevron_Right"
                        rtl="Chevron_Left"
                        className="ms-auto my-auto text-lg ltr:group-open:rotate-90 rtl:group-open:-rotate-90 transition"
                      />
                    </summary>
                    <div className="p-4 pt-2 space-y-1.5">
                      {Object.entries(PermissionFlags).map(([flag, value]) => (
                        <Checkbox
                          key={`permission-${flag}`}
                          checked={has(value)}
                          readOnly
                          label={t(`permission.${flag}`)}
                        />
                      ))}
                    </div>
                  </details>
                </div>
                <div className="rounded-lg bg-gray-100 dark:bg-gray-700 table w-full">
                  <div className="table-header-group">
                    <div className="table-row">
                      <Cell edges="tl" className="font-semibold">
                        {t("tab")}
                      </Cell>
                      <Cell edges="t" className="font-semibold">
                        {t("permissions")}
                      </Cell>
                      <Cell edges="tr" />
                    </div>
                  </div>
                  <div className="table-row-group">
                    <div className="table-row">
                      <Cell edges="l">{t("home")}</Cell>
                      <Cell>{t("justBeAMember")}</Cell>
                      <Cell edges="r">
                        <PermissionCircleCheck check />
                      </Cell>
                    </div>
                    <div className="table-row">
                      <Cell edges="l">{t("profile")}</Cell>
                      <Cell>
                        {new Intl.ListFormat().format(
                          ["ManageNicknames"].map((p) => t(`permission.${p}`)),
                        )}
                      </Cell>
                      <Cell edges="r">
                        <PermissionCircleCheck
                          check={has(PermissionFlags.ManageNicknames)}
                        />
                      </Cell>
                    </div>
                    <div className="table-row">
                      <Cell edges="l">{t("sessions")}</Cell>
                      <Cell>
                        {new Intl.ListFormat().format(
                          ["Administrator"].map((p) => t(`permission.${p}`)),
                        )}
                      </Cell>
                      <Cell edges="r">
                        <PermissionCircleCheck
                          check={has(PermissionFlags.ManageNicknames)}
                        />
                      </Cell>
                    </div>
                    <div className="table-row">
                      <Cell edges="l">{t("components")}</Cell>
                      <Cell>
                        {new Intl.ListFormat().format(
                          ["ManageMessages", "ManageWebhooks"].map((p) =>
                            t(`permission.${p}`),
                          ),
                        )}
                      </Cell>
                      <Cell edges="r">
                        <PermissionCircleCheck
                          check={has(
                            PermissionFlags.ManageMessages,
                            PermissionFlags.ManageWebhooks,
                          )}
                        />
                      </Cell>
                    </div>
                    <div className="table-row">
                      <Cell edges="l">{t("webhooks")}</Cell>
                      <Cell>{t("permission.ManageWebhooks")}</Cell>
                      <Cell edges="r">
                        <PermissionCircleCheck
                          check={has(PermissionFlags.ManageWebhooks)}
                        />
                      </Cell>
                    </div>
                    <div className="table-row">
                      <Cell edges="l">{t("auditLog")}</Cell>
                      <Cell>
                        {new Intl.ListFormat().format(
                          ["ViewAuditLog", "ManageGuild"].map((p) =>
                            t(`permission.${p}`),
                          ),
                        )}
                      </Cell>
                      <Cell edges="r">
                        <PermissionCircleCheck
                          check={has(
                            PermissionFlags.ViewAuditLog,
                            PermissionFlags.ManageGuild,
                          )}
                        />
                      </Cell>
                    </div>
                    <div className="table-row">
                      <Cell edges="bl">{t("triggers")}</Cell>
                      <Cell edges="b">{t("permission.ManageGuild")}</Cell>
                      <Cell edges="br">
                        <PermissionCircleCheck
                          check={has(PermissionFlags.ManageGuild)}
                        />
                      </Cell>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : tab === "webhooks" ? (
            <div>
              <div className="flex mb-2">
                <p className="text-xl font-semibold dark:text-gray-100 my-auto">
                  {t(tab)}
                </p>
                <Button
                  discordstyle={ButtonStyle.Secondary}
                  className="mb-auto ltr:ml-auto rtl:mr-auto"
                  disabled={webhooksForced || webhooksFetcher.state !== "idle"}
                  onClick={() =>
                    webhooksFetcher
                      .loadAsync(
                        `${apiUrl(BRoutes.guildWebhooks(guild.id))}?force=true`,
                      )
                      .then(() => setWebhooksForced(true))
                  }
                >
                  {t(webhooksForced ? "refreshed" : "forceRefresh")}
                </Button>
              </div>
              <div className="space-y-2">
                {webhooksFetcher.data
                  ? webhooksFetcher.data.map((webhook) => {
                      const createdAt = getDate(webhook.id as `${bigint}`);
                      const open = openWebhookId === webhook.id;
                      return (
                        <div
                          key={`webhook-${webhook.id}`}
                          className="rounded-lg bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22]"
                        >
                          <button
                            type="button"
                            className="p-4 flex w-full ltr:text-left rtl:text-right"
                            onClick={() =>
                              setOpenWebhookId(open ? undefined : webhook.id)
                            }
                          >
                            <img
                              {...cdnImgAttributes(64, (size) =>
                                webhookAvatarUrl(webhook, { size }),
                              )}
                              className="rounded-full my-auto w-10 h-10 ltr:mr-4 rtl:ml-4"
                              alt={webhook.name}
                            />
                            <div className="truncate my-auto">
                              <div className="flex max-w-full">
                                <p className="font-semibold truncate dark:text-primary-230 text-lg">
                                  <span className="align-baseline">
                                    {webhook.name}
                                  </span>
                                  {webhook.applicationId ===
                                    discordApplicationId && (
                                    <span
                                      className="ltr:ml-1 rtl:mr-1 inline-block"
                                      title={t("createdByDiscohook")}
                                    >
                                      <CoolIcon
                                        icon="Circle_Check"
                                        className="text-blurple-500 dark:text-blurple-400"
                                      />
                                    </span>
                                  )}
                                </p>
                              </div>
                              <p className="text-gray-600 dark:text-gray-500 text-xs">
                                <CoolIcon icon="Clock" />{" "}
                                {t(webhook.user ? "createdAtBy" : "createdAt", {
                                  replace: {
                                    createdAt,
                                    username: webhook.user?.name ?? "unknown",
                                  },
                                })}
                              </p>
                            </div>
                            <div className="ltr:ml-auto rtl:mr-auto ltr:pl-2 rtl:pr-2 my-auto flex gap-2 text-xl">
                              <CoolIcon
                                icon={open ? "Chevron_Down" : "Chevron_Right"}
                                rtl={open ? "Chevron_Down" : "Chevron_Left"}
                              />
                            </div>
                          </button>
                        </div>
                      );
                    })
                  : Array(10)
                      .fill(undefined)
                      .map((_, i) => (
                        <div
                          key={`webhook-skeleton-${i}`}
                          className="rounded-lg p-4 bg-gray-100 dark:bg-[#1E1F22]/50 flex animate-pulse"
                          // Not sure if I like the fading look more than the uniform pulse
                          // style={{ opacity: 1 - i / a.length }}
                        >
                          <div className="bg-gray-400 dark:bg-gray-500 rounded-full my-auto w-10 h-10 ltr:mr-4 rtl:ml-4" />
                          <div className="my-auto">
                            <div className="bg-gray-400 dark:bg-gray-500 rounded-full h-4 w-20" />
                            <div className="bg-gray-400 dark:bg-gray-500 rounded-full h-3 w-28 mt-0.5" />
                          </div>
                        </div>
                      ))}
              </div>
              <div className="flex mt-2">
                <Button
                  discordstyle={ButtonStyle.Secondary}
                  onClick={() => {
                    const p = page - 1;
                    webhooksFetcher.load(
                      `${apiUrl(BRoutes.guildWebhooks(guild.id))}?withInaccessible=true&page=${p}`,
                    );
                    setPage(p);
                  }}
                  disabled={page === 1 || !webhooksFetcher.data}
                >
                  <Trans
                    t={t}
                    i18nKey="previousPage"
                    components={[
                      <CoolIcon
                        key="0"
                        icon="Chevron_Left"
                        rtl="Chevron_Right"
                      />,
                    ]}
                  />
                </Button>
                <Button
                  className="ltr:ml-auto rtl:mr-auto"
                  discordstyle={ButtonStyle.Secondary}
                  onClick={() => {
                    const p = page + 1;
                    webhooksFetcher.load(
                      `${apiUrl(BRoutes.guildWebhooks(guild.id))}?withInaccessible=true&page=${p}`,
                    );
                    setPage(p);
                  }}
                  disabled={
                    !webhooksFetcher.data || webhooksFetcher.data.length < 50
                  }
                >
                  <Trans
                    t={t}
                    i18nKey="nextPage"
                    components={[
                      <CoolIcon
                        key="0"
                        icon="Chevron_Right"
                        rtl="Chevron_Left"
                      />,
                    ]}
                  />
                </Button>
              </div>
            </div>
          ) : tab === "auditLog" ? (
            <div>
              <TabHeader
                subtitle={
                  <p>
                    <Trans
                      t={t}
                      i18nKey="auditLogSubtitle"
                      components={[<span key="0" className="font-semibold" />]}
                      values={{ guild }}
                    />
                  </p>
                }
              >
                {t("auditLog")}
              </TabHeader>
              {/* <div className="grid grid-cols-4 gap-2 mb-2">
                <div>
                  <SimpleStringSelect
                    t={t}
                    label="Filter by Action"
                    value={
                      auditLogFetcher.data
                        ? (auditLogFetcher.data.query.action ?? null)
                        : null
                    }
                    options={[
                      {
                        label: t("allActions"),
                        value: null,
                      },
                      {
                        label: "Send",
                        value: "send",
                      },
                      {
                        label: "Edit",
                        value: "edit",
                      },
                      {
                        label: "Delete",
                        value: "delete",
                      },
                    ]}
                    onChange={(val) => {
                      const query = cloneQuery({
                        ...(auditLogFetcher.data?.query ?? {}),
                        action: val,
                        page: 1,
                      });
                      auditLogFetcher.load(
                        `${apiUrl(BRoutes.guildLog(guild.id))}?${query}`,
                      );
                    }}
                  />
                </div>
                <div>
                  <SimpleStringSelect
                    t={t}
                    label="Filter by Webhook"
                    value={
                      auditLogFetcher.data
                        ? (auditLogFetcher.data.query.webhookId ?? null)
                        : null
                    }
                    options={[
                      {
                        label: "All Webhooks",
                        value: null,
                      },
                      ...(auditLogFetcher.data
                        ? auditLogFetcher.data.webhooks.map((webhook) => ({
                            label: webhook.name, // TODO: include avatar
                            value: webhook.id,
                            stringLabel: webhook.name,
                          }))
                        : []),
                    ]}
                    onChange={(val) => {
                      const query = cloneQuery({
                        ...(auditLogFetcher.data?.query ?? {}),
                        webhookId: val,
                        page: 1,
                      });
                      auditLogFetcher.load(
                        `${apiUrl(BRoutes.guildLog(guild.id))}?${query}`,
                      );
                    }}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium cursor-default">
                    Filter by Channel
                  </p>
                  <ChannelSelect
                    t={t}
                    clearable
                    channels={
                      auditLogFetcher.data
                        ? auditLogFetcher.data.entries
                            .map((entry) => {
                              const channel = cache.channel.get(
                                entry.channelId,
                              );
                              return (
                                channel ?? {
                                  type: "text",
                                  id: entry.channelId,
                                  name: `unknown (${entry.channelId})`,
                                }
                              );
                            })
                            .filter(
                              (chan, i, a): chan is ResolvableAPIChannel =>
                                a.findIndex((c) => c.id === chan.id) === i,
                            )
                        : []
                    }
                    onChange={(val) => {
                      const query = cloneQuery({
                        ...(auditLogFetcher.data?.query ?? {}),
                        channelId: val ? val.id : null,
                        page: 1,
                      });
                      auditLogFetcher.load(
                        `${apiUrl(BRoutes.guildLog(guild.id))}?${query}`,
                      );
                    }}
                  />
                </div>
              </div> */}
              <div className="space-y-2">
                {auditLogFetcher.data ? (
                  auditLogFetcher.data.entries.map((entry) => {
                    const createdAt = new Date(
                      getId({ id: entry.id }).timestamp,
                    );
                    const webhook = auditLogFetcher.data?.webhooks.find(
                      (w) => w.id === entry.webhookId,
                    );
                    return (
                      <div
                        key={`message-entry-${entry.id}`}
                        className="rounded-lg py-3 px-4 bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22] flex"
                      >
                        <img
                          {...cdnImgAttributes(64, (size) =>
                            webhook
                              ? webhookAvatarUrl(webhook, { size })
                              : cdn.defaultAvatar(5),
                          )}
                          className="rounded-full my-auto w-10 h-10 mr-2 hidden sm:block"
                          alt="Target webhook"
                        />
                        <div className="truncate my-auto">
                          <div className="flex max-w-full">
                            <p className="font-medium truncate dark:text-[#f9f9f9] text-base">
                              {entry.user?.discordUser ? (
                                <img
                                  {...cdnImgAttributes(64, (size) =>
                                    getUserAvatar(
                                      {
                                        discordUser: {
                                          // biome-ignore lint/style/noNonNullAssertion: Ternary above
                                          ...entry.user?.discordUser!,
                                          discriminator: null,
                                        },
                                      },
                                      { size },
                                    ),
                                  )}
                                  alt=""
                                  className="rounded-full h-4 inline-block self-center me-1 -mt-[0.375rem]"
                                />
                              ) : null}
                              <Trans
                                t={t}
                                i18nKey={`auditLogMessage.${webhook ? "webhookAction" : "webhooklessAction"}.${entry.type}`}
                                values={{
                                  username:
                                    entry.user?.discordUser?.name ??
                                    t("anonymous"),
                                  webhook,
                                }}
                                components={[
                                  entry.user?.discordUser ? (
                                    <button
                                      key="0"
                                      type="button"
                                      className="dark:text-primary-300 cursor-pointer"
                                      onClick={() => {
                                        if (!entry.user?.discordUser) return;
                                        copyText(
                                          String(entry.user.discordUser.id),
                                        );
                                      }}
                                    />
                                  ) : (
                                    <span key="0" />
                                  ),
                                ]}
                              />
                            </p>
                          </div>
                          <p className="text-muted dark:text-muted-dark text-xs">
                            {new Date(createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-auto pl-2 my-auto flex gap-2">
                          <a
                            href={`https://discord.com/channels/${guild.id}/${
                              entry.threadId ?? entry.channelId
                            }/${entry.messageId}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button discordstyle={ButtonStyle.Secondary}>
                              <CoolIcon icon="External_Link" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p>Loading...</p>
                )}
              </div>
            </div>
          ) : tab === "sessions" ? (
            <div>
              <TabHeader
                subtitle={
                  <Trans
                    t={t}
                    i18nKey="sessionsSubtitle"
                    values={{ guild }}
                    components={[<span key="0" className="font-semibold" />]}
                  />
                }
              >
                {t("sessions")}
              </TabHeader>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                  <Button
                    discordstyle={ButtonStyle.Secondary}
                    disabled={!sessionsFetcher.data?.results?.length}
                    onClick={() => {
                      if (selectedSessionIds.length === 0) {
                        setSelectedSessionIds({
                          action: "overwrite",
                          value:
                            sessionsFetcher.data?.results
                              .filter((s) => !s.me)
                              .map((s) => s.tokenId) ?? [],
                        });
                      } else {
                        setSelectedSessionIds({
                          action: "overwrite",
                          value: [],
                        });
                      }
                    }}
                  >
                    {t(
                      selectedSessionIds.length === 0
                        ? "selectAll"
                        : "selectNone",
                    )}
                  </Button>
                  <Button
                    discordstyle={ButtonStyle.Danger}
                    disabled={selectedSessionIds.length === 0}
                    onClick={() =>
                      setConfirm({
                        title: t("revokeSessions", {
                          count: selectedSessionIds.length,
                        }),
                        children: (
                          <>
                            <p>{t("revokeSessionsConfirm")}</p>
                            <Button
                              onClick={async () => {
                                const params = new URLSearchParams();
                                for (const id of selectedSessionIds) {
                                  params.append("id", id);
                                }
                                await sessionFetcher.submitAsync(undefined, {
                                  action: `${apiUrl(
                                    BRoutes.guildSessions(guild.id),
                                  )}?${params}`,
                                  method: "DELETE",
                                });
                                setConfirm(undefined);

                                const sessionsParams = new URLSearchParams();
                                if (sessionsFetcher.data?.channelId) {
                                  sessionsParams.set(
                                    "channelId",
                                    sessionsFetcher.data.channelId,
                                  );
                                }
                                sessionsFetcher.load(
                                  `${apiUrl(BRoutes.guildSessions(guild.id))}?${sessionsParams}`,
                                );
                                setSelectedSessionIds({
                                  action: "overwrite",
                                  value: [],
                                });
                              }}
                              className="mt-2"
                              discordstyle={ButtonStyle.Danger}
                            >
                              {t("revoke")}
                            </Button>
                          </>
                        ),
                      })
                    }
                  >
                    {t("revokeCount", { count: selectedSessionIds.length })}
                  </Button>
                </div>
                <div>
                  <p className="text-sm font-medium select-none">
                    {t("channel")}
                  </p>
                  <ChannelSelect
                    t={t}
                    channels={cache.channel.getAll()}
                    disabled={!sessionsFetcher.data}
                    clearable
                    clearableLabelKey="sessionsAllChannels"
                    value={
                      sessionsFetcher.data?.channelId
                        ? (cache.channel.get(sessionsFetcher.data.channelId) ??
                          null)
                        : null
                    }
                    onChange={(channel) => {
                      const params = new URLSearchParams();
                      if (channel) {
                        params.set("channelId", channel.id);
                      }
                      sessionsFetcher.load(
                        `${apiUrl(BRoutes.guildSessions(guild.id))}?${params}`,
                      );
                      setSelectedSessionIds({
                        action: "overwrite",
                        value: [],
                      });
                    }}
                  />
                </div>
                {sessionsFetcher.state !== "idle" ? (
                  <div className="space-y-2 animate-pulse">
                    {Array(5)
                      .fill(undefined)
                      .map((_, i) => (
                        <div
                          key={`session-skeleton-${i}`}
                          className="rounded-lg py-3 px-4 bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22]"
                        >
                          <div className="flex items-center me-3">
                            <Checkbox label={<></>} checked={false} />
                            <div className="size-7 aspect-square rounded-lg bg-muted-dark dark:bg-muted me-1.5" />
                            <div>
                              <div className="rounded-full bg-muted-dark dark:bg-muted h-3 w-32" />
                              <div className="rounded-full bg-muted-dark dark:bg-muted h-3 w-16 mt-0.5" />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : sessionsFetcher.data ? (
                  sessionsFetcher.data.results.map((session) => {
                    const permissions = new PermissionsBitField(
                      BigInt(session.permissions),
                    );
                    const permissionsList = Object.entries(PermissionFlags)
                      .map(([flag, value]) => ({
                        flag,
                        value,
                        has: session.owner ? true : permissions.has(value),
                      }))
                      .filter((p) => p.has);

                    // "High priority" permissions
                    const mainFlags: string[] = [];
                    if (
                      !session.owner &&
                      !permissions.has(PermissionFlags.Administrator)
                    ) {
                      for (const flag of [
                        "ManageWebhooks",
                        "ManageGuild",
                        "ManageMessages",
                        "ManageRoles",
                      ] as const) {
                        if (permissions.has(PermissionFlags[flag])) {
                          mainFlags.push(flag);
                        }
                      }
                    }

                    const expiresMs = session.expiresAt - Date.now();
                    return (
                      <Collapsible.Root
                        key={`session-${session.tokenId}`}
                        className="rounded-lg py-3 px-4 bg-gray-100 dark:bg-[#1E1F22]/30 border border-transparent dark:border-[#1E1F22]"
                      >
                        <div className="flex items-center me-3">
                          <Checkbox
                            label={<></>}
                            checked={selectedSessionIds.includes(
                              session.tokenId,
                            )}
                            onCheckedChange={(checked) =>
                              setSelectedSessionIds({
                                action: checked ? "add" : "remove",
                                value: session.tokenId,
                              })
                            }
                          />
                          <div className="text-muted dark:text-muted-dark me-1.5">
                            {session.owner ? (
                              <CrownIcon className="size-7 text-[#8D5D1F] dark:text-[#D3AE7C]" />
                            ) : permissions.has(
                                PermissionFlags.Administrator,
                              ) ? (
                              <RoleShield className="size-7" />
                            ) : (
                              <PeopleIcon className="size-7" />
                            )}
                          </div>
                          <div className="truncate">
                            <div className="flex max-w-full items-center overflow-x-hidden">
                              <p className="font-medium truncate text-base">
                                {session.owner
                                  ? t("owner")
                                  : permissions.has(
                                        PermissionFlags.Administrator,
                                      )
                                    ? t("permission.Administrator")
                                    : t("permissionsCount", {
                                        count: permissionsList.length,
                                      })}
                              </p>
                              {session.me ? (
                                <span className="text-[10px] font-semibold rounded px-1.5 py-px ms-1.5 text-muted dark:text-muted-dark bg-gray-200 dark:bg-gray-700 uppercase shrink-0">
                                  {t("thisDevice")}
                                </span>
                              ) : null}
                              {mainFlags.slice(0, 3).map((flag) => (
                                <span
                                  key={`session-${session.tokenId}-flag-tag-${flag}`}
                                  className="text-[10px] font-semibold rounded px-1.5 py-px ms-0.5 first-of-type:ms-1.5 text-muted dark:text-muted-dark bg-gray-200 dark:bg-gray-700 uppercase shrink-0"
                                >
                                  {t(`permission.${flag}`)}
                                </span>
                              ))}
                            </div>
                            <p className="text-muted dark:text-muted-dark text-xs">
                              {new Date(session.createdAt).toLocaleString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                },
                              )}{" "}
                              -{" "}
                              {new Date(session.expiresAt).toLocaleString(
                                undefined,
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="ms-auto flex gap-2 group/trigger rounded-lg px-2 aspect-square hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-red-400 transition-colors"
                            title={t("revokeSession")}
                            onClick={async () => {
                              const params = new URLSearchParams();
                              if (sessionsFetcher.data?.channelId) {
                                params.set(
                                  "channelId",
                                  sessionsFetcher.data.channelId,
                                );
                              }
                              await sessionFetcher.submitAsync(undefined, {
                                action: `${apiUrl(
                                  BRoutes.guildSession(
                                    guild.id,
                                    session.tokenId,
                                  ),
                                )}?${params}`,
                                method: "DELETE",
                              });
                              sessionsFetcher.load(
                                apiUrl(BRoutes.guildSessions(guild.id)),
                              );
                              setSelectedSessionIds({
                                action: "overwrite",
                                value: [],
                              });
                            }}
                          >
                            <CoolIcon
                              icon="Trash_Full"
                              className="text-lg m-auto"
                            />
                          </button>
                          <Collapsible.Trigger className="ms-2 flex gap-2 group/trigger">
                            <CoolIcon
                              icon="Chevron_Right"
                              rtl="Chevron_Left"
                              className="text-lg ltr:group-data-[panel-open]/trigger:rotate-90 rtl:group-data-[panel-open]/trigger:-rotate-90 transition-transform"
                            />
                          </Collapsible.Trigger>
                        </div>
                        <Collapsible.Panel
                          className={twMerge(collapsibleStyles.panel, "pt-2")}
                        >
                          <div className="text-sm">
                            <p>{t("sessionPanelDescription")}</p>
                            <p className="italic text-muted dark:text-muted-dark mt-1">
                              {t("expiresIn", {
                                replace: [
                                  expiresMs < 3_600_000
                                    ? t("timestamp.relative.minutes_future", {
                                        count: Math.round(expiresMs / 60_000),
                                      })
                                    : t("timestamp.relative.hours_future", {
                                        count: Math.round(
                                          expiresMs / 3_600_000,
                                        ),
                                      }),
                                ],
                              })}
                            </p>
                          </div>
                          <div className="space-y-1">
                            {(
                              [
                                "Administrator",
                                "ManageGuild",
                                "ManageWebhooks",
                                "ManageRoles",
                                "ManageMessages",
                                "ManageNicknames",
                              ] as const
                            ).map((flag) => (
                              <Checkbox
                                key={`session-${session.tokenId}-permission-${flag}`}
                                checked={
                                  session.owner ||
                                  permissions.has(PermissionFlags[flag])
                                }
                                readOnly
                                label={t(`permission.${flag}`)}
                              />
                            ))}
                          </div>
                        </Collapsible.Panel>
                      </Collapsible.Root>
                    );
                  })
                ) : (
                  <></>
                )}
              </div>
            </div>
          ) : tab === "profile" ? (
            <div>
              <TabHeader subtitle={<p>{t("serverProfileDescription")}</p>}>
                {t("profile")}
              </TabHeader>
              <Form
                // form is all the way up here so it can capture the avatar and banner inputs on the right
                className="flex flex-col-reverse md:flex-row gap-8"
                // method="PATCH"
                // action={apiUrl(BRoutes.guildProfile(guild.id))}
                onSubmit={(e) => {
                  e.preventDefault();

                  const data = new FormData(e.currentTarget);
                  if (!profileForm.submitBio) {
                    data.delete("bio");
                  }

                  const avatar = data.get("avatar");
                  if (avatar instanceof File && avatar.size === 0) {
                    data.delete("avatar");
                  }
                  if (profileForm.avatarObjectURL === null) {
                    data.set("avatar", "");
                  }
                  const banner = data.get("banner");
                  if (banner instanceof File && banner.size === 0) {
                    data.delete("banner");
                  }
                  if (profileForm.bannerObjectURL === null) {
                    data.set("banner", "");
                  }

                  profileFetcher.submit(data, {
                    method: "PATCH",
                    action: apiUrl(BRoutes.guildProfile(guild.id)),
                  });
                }}
              >
                <div className="space-y-4 grow">
                  <Field.Root>
                    <TextInput
                      label={t("name")}
                      name="nick"
                      className="w-full"
                      value={profileForm.nick ?? ""}
                      disabled={profileFetcher.state !== "idle"}
                      maxLength={32}
                      placeholder={
                        profileFetcher.data?.user.global_name ||
                        profileFetcher.data?.user.username ||
                        "Discohook Utils"
                      }
                      onChange={(e) => {
                        setProfileForm({
                          ...profileForm,
                          nick: e.currentTarget.value ?? null,
                        });
                      }}
                    />
                  </Field.Root>
                  <Field.Root>
                    <TextArea
                      label={t("bio")}
                      name="bio"
                      className="w-full"
                      value={profileForm.bio ?? ""}
                      disabled={
                        profileFetcher.state !== "idle" ||
                        !profileForm.submitBio
                      }
                      maxLength={190}
                      onChange={(e) => {
                        setProfileForm({
                          ...profileForm,
                          bio: e.currentTarget.value ?? null,
                        });
                      }}
                      placeholder="Discohook!"
                      markdown={bioMarkdownFeatures}
                      cache={cache}
                    />
                    {profileFetcher.data?.bio === undefined ? (
                      <div className="mt-2">
                        <Checkbox
                          label={t("changeBio")}
                          description={
                            <p className="text-sm text-muted dark:text-muted-dark">
                              {t("bioWriteOnlyChange")}
                            </p>
                          }
                          checked={profileForm.submitBio ?? false}
                          onCheckedChange={(submitBio) => {
                            setProfileForm({ ...profileForm, submitBio });
                          }}
                        />
                      </div>
                    ) : null}
                  </Field.Root>
                  <Button
                    type="submit"
                    discordstyle={ButtonStyle.Success}
                    disabled={profileFetcher.state !== "idle"}
                  >
                    {t("save")}
                  </Button>
                </div>
                <div>
                  <p className="text-sm font-medium mb-0.5 cursor-default">
                    {t("preview")}
                  </p>
                  {profileFetcher.data ? (
                    <ProfilePreview
                      t={t}
                      user={{ bot: true, ...profileFetcher.data.user }}
                      member={{
                        guild_id: guild.id,
                        nick: profileForm.nick,
                        bio: profileForm.submitBio
                          ? profileForm.bio
                          : undefined,
                        avatar:
                          profileForm.avatarObjectURL === null
                            ? null
                            : profileFetcher.data.avatar,
                        banner:
                          profileForm.bannerObjectURL === null
                            ? null
                            : profileFetcher.data.banner,
                      }}
                      avatarURL={profileForm.avatarObjectURL ?? undefined}
                      setAvatarObjectURL={(avatarObjectURL) => {
                        setProfileForm({ ...profileForm, avatarObjectURL });
                      }}
                      bannerURL={profileForm.bannerObjectURL ?? undefined}
                      setBannerObjectURL={(bannerObjectURL) => {
                        setProfileForm({ ...profileForm, bannerObjectURL });
                      }}
                    />
                  ) : (
                    <div
                      className={twJoin(
                        "rounded-lg w-64 h-52 shadow-lg bg-white dark:bg-gray-800",
                        "box-border gap-2 animate-pulse",
                        "border border-border-normal dark:border-border-normal-dark",
                      )}
                    />
                  )}
                  <div className="mt-2 w-64 flex flex-col gap-1.5">
                    {(profileForm.avatarObjectURL ||
                      profileFetcher.data?.avatar) &&
                    // null indicates there will be no avatar
                    profileForm.avatarObjectURL !== null ? (
                      <Button
                        discordstyle={ButtonStyle.Secondary}
                        type="button"
                        className="w-full"
                        onClick={() => {
                          const el = document.querySelector<HTMLInputElement>(
                            "#profile-avatar>input",
                          );
                          if (el) el.value = "";

                          console.log(profileForm, profileFetcher.data);
                          if (profileForm.avatarObjectURL) {
                            URL.revokeObjectURL(profileForm.avatarObjectURL);
                            // only clear yet-unsubmitted data
                            setProfileForm({
                              ...profileForm,
                              avatarObjectURL: undefined,
                            });
                          } else {
                            // clear the data already on the server
                            setProfileForm({
                              ...profileForm,
                              avatarObjectURL: null,
                            });
                          }
                        }}
                      >
                        {t("removeAvatar")}
                      </Button>
                    ) : null}
                    {(profileForm.bannerObjectURL ||
                      profileFetcher.data?.banner) &&
                    // null indicates there will be no banner
                    profileForm.bannerObjectURL !== null ? (
                      <Button
                        discordstyle={ButtonStyle.Secondary}
                        type="button"
                        className="w-full"
                        onClick={() => {
                          const el = document.querySelector<HTMLInputElement>(
                            "#profile-banner>input",
                          );
                          if (el) el.value = "";

                          if (profileForm.bannerObjectURL) {
                            URL.revokeObjectURL(profileForm.bannerObjectURL);
                            // only clear yet-unsubmitted data
                            setProfileForm({
                              ...profileForm,
                              bannerObjectURL: undefined,
                            });
                          } else {
                            // clear the data already on the server
                            setProfileForm({
                              ...profileForm,
                              bannerObjectURL: null,
                            });
                          }
                        }}
                      >
                        {t("removeBanner")}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Form>
            </div>
          ) : tab === "triggers" ? (
            openTrigger ? (
              <div>
                <div className="flex gap-2 items-center mb-2 text-muted dark:text-muted-dark text-sm">
                  <button
                    type="button"
                    onClick={() => setOpenTriggerId(undefined)}
                    className="hover:text-black dark:hover:text-gray-50 transition-colors"
                  >
                    {t("triggers")}
                  </button>
                  <span>/</span>
                  <span>{t(`triggerEvent.${openTrigger.event}`)}</span>
                </div>
                <div className="rounded-lg p-4 border border-black/10 dark:border-[#44454B] flex">
                  <div className="grow ltr:mr-2 rtl:ml-2">
                    <p className="font-normal text-base mb-1">
                      {t("createTrigger.when")}
                    </p>
                    <div className="rounded-lg flex items-center h-9 px-[14px] w-full bg-gray-200 dark:bg-gray-900">
                      {t(`triggerEventDescription.${openTrigger.event}`)}
                    </div>
                  </div>
                  <div className="h-full flex flex-col">
                    <CoolIcon
                      icon={flowEventsDetails[openTrigger.event].icon}
                      className="text-[4rem] m-auto"
                    />
                  </div>
                </div>
                <div className="w-full flex my-0.5">
                  <CoolIcon
                    icon="Arrow_Down_MD"
                    className="m-auto text-base text-muted dark:text-muted-dark opacity-50"
                  />
                </div>
                <div className="rounded-lg p-4 border border-black/10 dark:border-[#44454B]">
                  <p className="font-normal text-base mb-1">
                    {t("createTrigger.then")}
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => setEditOpenTriggerFlow(true)}>
                      {t("editFlow")}
                    </Button>
                    <Button
                      discordstyle={ButtonStyle.Secondary}
                      disabled={
                        triggerSaveFetcher.state !== "idle" ||
                        triggerEventTestFetcher.state !== "idle"
                      }
                      onClick={() =>
                        triggerEventTestFetcher.submit(null, {
                          action: apiUrl(
                            BRoutes.guildTriggerEvent(
                              guild.id,
                              openTrigger.event,
                            ),
                          ),
                          method: "PUT",
                        })
                      }
                    >
                      {t("sendTestEvent")}
                    </Button>
                  </div>
                </div>
                <div className="w-full flex my-0.5">
                  <CoolIcon
                    icon="Save"
                    className="m-auto text-base text-muted dark:text-muted-dark opacity-50"
                  />
                </div>
                <div className="rounded-lg p-4 border border-black/10 dark:border-[#44454B]">
                  <div className="flex gap-2">
                    <Button
                      discordstyle={ButtonStyle.Success}
                      disabled={triggerSaveFetcher.state !== "idle"}
                      onClick={async () => {
                        if (draftFlow) {
                          await triggerSaveFetcher.submitAsync(
                            { flow: draftFlow },
                            {
                              action: apiUrl(
                                BRoutes.guildTrigger(guild.id, openTrigger.id),
                              ),
                              method: "PATCH",
                            },
                          );
                        }
                      }}
                    >
                      {t("save")}
                    </Button>
                    <Button
                      discordstyle={ButtonStyle.Danger}
                      disabled={triggerSaveFetcher.state !== "idle"}
                      onClick={() =>
                        setConfirm({
                          title: t("deleteTrigger"),
                          children: (
                            <>
                              <p>
                                {t("deleteTriggerConfirm", {
                                  replace: [openTrigger.event],
                                })}
                              </p>
                              <Button
                                onClick={async () => {
                                  await triggerSaveFetcher.submitAsync(
                                    undefined,
                                    {
                                      action: apiUrl(
                                        BRoutes.guildTrigger(
                                          guild.id,
                                          openTrigger.id,
                                        ),
                                      ),
                                      method: "DELETE",
                                    },
                                  );
                                  setOpenTriggerId(undefined);
                                  setConfirm(undefined);
                                  triggersFetcher.load(
                                    apiUrl(BRoutes.guildTriggers(guild.id)),
                                  );
                                }}
                                className="mt-2"
                                discordstyle={ButtonStyle.Danger}
                              >
                                {t("delete")}
                              </Button>
                            </>
                          ),
                        })
                      }
                    >
                      {t("delete")}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex mb-2">
                  <p className="text-xl font-semibold dark:text-gray-100 my-auto">
                    {t(tab)}
                  </p>
                  <Button
                    onClick={() => setCreatingTrigger(true)}
                    className="mb-auto ltr:ml-auto rtl:mr-auto"
                  >
                    {t("newTrigger")}
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {triggersFetcher.data ? (
                    triggersFetcher.data.map((trigger) => {
                      const meta = flowEventsDetails[trigger.event];
                      return (
                        <button
                          key={`trigger-${trigger.id}`}
                          type="button"
                          className="rounded-lg p-2 w-28 bg-primary-160 hover:bg-primary-230 dark:bg-background-secondary-dark dark:hover:bg-[#232428] transition hover:-translate-y-1 hover:shadow-lg flex flex-col"
                          onClick={() => setOpenTriggerId(trigger.id)}
                        >
                          <CoolIcon
                            icon={meta.icon}
                            className="text-6xl mx-auto opacity-80"
                          />
                          <p className="text-center font-medium truncate text-sm">
                            {t(`triggerEvent.${trigger.event}`)}
                          </p>
                        </button>
                      );
                    })
                  ) : (
                    <p>Loading...</p>
                  )}
                </div>
              </div>
            )
          ) : tab === "components" ? (
            <div>
              <TabHeader>{t("components")}</TabHeader>
              <div>
                {componentsFetcher.data
                  ? (() => {
                      // biome-ignore lint/style/noNonNullAssertion: Above
                      const allComponents = componentsFetcher.data!;
                      const byChannel: Record<
                        string,
                        Record<string, typeof allComponents>
                      > = {};
                      for (const component of allComponents) {
                        const channelId = component.channelId?.toString() ?? "";
                        const messageId = component.messageId?.toString() ?? "";
                        byChannel[channelId] = byChannel[channelId] ?? {};
                        byChannel[channelId][messageId] =
                          byChannel[channelId][messageId] ?? [];
                        byChannel[channelId][messageId].push(component);
                      }

                      return (
                        <div className="space-y-4">
                          {Object.entries(byChannel).map(
                            ([channelId, byMessage]) => {
                              return (
                                <div key={`components-${channelId}`}>
                                  <div
                                    className="text-base font-medium"
                                    style={{
                                      // @ts-expect-error
                                      "--font-size": "1rem",
                                    }}
                                  >
                                    {channelId ? (
                                      <a
                                        href={`https://discord.com/channels/${guild.id}/${channelId}`}
                                        className="contents"
                                        target="_blank"
                                        rel="noreferrer"
                                      >
                                        <Markdown
                                          content={`<#${channelId}>`}
                                          features="full"
                                          cache={cache}
                                        />
                                      </a>
                                    ) : (
                                      "None"
                                    )}
                                  </div>
                                  <div className="space-y-2 mt-1">
                                    {Object.entries(byMessage).map(
                                      ([messageId, components]) => (
                                        <div
                                          key={`components-message-${messageId}`}
                                          className="flex p-2 text-base text-gray-600 dark:text-gray-400 rounded bg-blurple/10 hover:bg-blurple/15 border border-blurple/30 shadow hover:shadow-lg transition"
                                        >
                                          <div className="flex flex-wrap gap-x-1.5 gap-y-0 mt-1 me-4">
                                            {components.map((component) => (
                                              <PreviewableListedMessageComponent
                                                key={`component-${component.id}`}
                                                t={t}
                                                component={component}
                                                cache={cache}
                                                guild={guild}
                                                user={user}
                                                setConfirm={setConfirm}
                                                componentsFetcher={
                                                  componentsFetcher
                                                }
                                                componentActioner={
                                                  componentActioner
                                                }
                                              />
                                            ))}
                                          </div>
                                          {channelId && messageId && (
                                            <div className="border-l border-l-blurple/30 ms-auto ps-4 pe-1 flex">
                                              <a
                                                href={`https://discord.com/channels/${guild.id}/${channelId}/${messageId}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="m-auto"
                                              >
                                                <PostChannelIcon className="size-8 hover:opacity-80 transition-opacity" />
                                              </a>
                                            </div>
                                          )}
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              );
                            },
                          )}
                        </div>
                      );
                    })()
                  : Array(10)
                      .fill(undefined)
                      .map((_, i) => (
                        <div
                          key={`component-skeleton-${i}`}
                          className="h-16 rounded bg-blurple/10 hover:bg-blurple/15 border border-blurple/30 shadow hover:shadow-lg transition mb-2"
                        />
                      ))}
              </div>
            </div>
          ) : (
            <></>
          )}
        </TabsWindow>
      </Prose>
    </div>
  );
};

interface PreviewableListedMessageComponentProps {
  t: TFunction;
  component: NonNullable<
    SafeFetcher<typeof ApiGetGuildComponents>["data"]
  >[number];
  cache: CacheManager;
  user: User;
  guild: {
    id: string;
    name: string;
    icon: string | null;
  };
  setConfirm: React.Dispatch<
    React.SetStateAction<ConfirmModalProps | undefined>
  >;
  componentsFetcher: SafeFetcher<typeof ApiGetGuildComponents>;
  componentActioner: SafeFetcher<typeof ApiComponentAction>;
}

const PreviewableListedMessageComponent = (
  props: PreviewableListedMessageComponentProps,
) => {
  const { t, component, cache, guild, setConfirm } = props;
  const navigate = useNavigate();

  const responsibleId =
    component.data.type === ComponentType.Button &&
    component.data.style === ButtonStyle.Link
      ? null
      : (
          component.updatedBy?.discordId || component.createdBy?.discordId
        )?.toString();

  const previewableComponentData = useMemo(() => {
    const built = buildStorableComponent(
      // @ts-expect-error close enough; doesn't need flow data
      component.data,
      String(component.id),
    );
    if (
      built.type === ComponentType.Button &&
      built.style === ButtonStyle.Link
    ) {
      // components in the list page should be benign
      built.url = "";
    }

    return built;
  }, [component]);

  return (
    <div
      className={twJoin(
        getComponentWidth(component.data) >= 5
          ? "block w-full my-1 first:mt-0"
          : "contents",
      )}
    >
      <GenericPreviewComponentInActionRow
        data={previewableComponentData}
        cache={cache}
        t={t}
        onClick={(e) => {
          if (e.shiftKey) {
            navigate(`/edit/component/${component.id}`);
            return;
          }
          const responsibleUser = responsibleId
            ? cache.member.get(responsibleId, guild.id)
            : undefined;
          setConfirm({
            title: t("messageComponent"),
            children: (
              <PreviewableListedMessageComponentConfirmContent
                {...props}
                responsibleId={responsibleId}
                responsibleUser={responsibleUser}
              />
            ),
          });
        }}
      />
    </div>
  );
};

const PreviewableListedMessageComponentConfirmContent = ({
  t,
  cache,
  component,
  guild,
  user,
  componentsFetcher,
  componentActioner,
  responsibleId: responsibleId_,
  responsibleUser: responsibleUser_,
  setConfirm,
}: PreviewableListedMessageComponentProps & {
  responsibleId: string | null | undefined;
  responsibleUser: ResolvableAPIGuildMember | null | undefined;
}) => {
  const copyIdButton = (
    <button
      type="button"
      className="inline-block ms-1.5"
      title={t("copyId")}
      onClick={(e) => {
        if (!responsibleId) return;

        copyText(responsibleId);
        const icon = e.currentTarget.querySelector("i");
        if (icon) {
          icon.classList.add("ci-Check");
          icon.classList.remove("ci-Copy");
          setTimeout(() => {
            icon.classList.add("ci-Copy");
            icon.classList.remove("ci-Check");
          }, 1500);
        }
      }}
    >
      <CoolIcon icon="Copy" />
    </button>
  );

  const [responsibleId, setResponsibleId] = useState(responsibleId_);
  const [responsibleUser, setResponsibleUser] = useState(responsibleUser_);

  return (
    <>
      <div className="flex w-full gap-4">
        <div className="m-auto shrink-0">
          <GenericPreviewComponentInActionRow
            data={buildStorableComponent(
              // @ts-expect-error close enough; doesn't need flow data
              component.data,
              String(component.id),
            )}
            cache={cache}
            t={t}
          />
        </div>
        {/* This box is not necessary for non-interactive components */}
        {responsibleId === null ? null : (
          <div
            key={`responsible-${responsibleId}`}
            className={twJoin(
              "px-3 py-2 max-w-[50%] bg-gray-200 dark:bg-gray-800 rounded-lg",
              "border border-border-normal dark:border-border-normal-dark",
            )}
          >
            <p className="font-medium text-sm text-muted dark:text-muted-dark">
              <Trans
                t={t}
                i18nKey="responsibleUserLink"
                components={{
                  anchor: (
                    <Link
                      to="/guide/troubleshooting/responsibility"
                      className="hover:text-blue-430 dark:hover:text-blue-345 transition-colors"
                    >
                      <CoolIcon icon="Circle_Help" />
                    </Link>
                  ),
                }}
              />
            </p>
            {responsibleUser ? (
              <>
                <span
                  className={actionableMentionStyle}
                  data-mention-id={responsibleId}
                >
                  @
                  {responsibleUser.nick ??
                    responsibleUser.user.global_name ??
                    responsibleUser.user.username}
                </span>
                {copyIdButton}
              </>
            ) : responsibleId ? (
              <>
                <span className={codeStyle}>{responsibleId}</span>
                {copyIdButton}
              </>
            ) : (
              <p className="text-sm leading-tight">{t("indeterminable")}</p>
            )}
            <hr className="mt-1 mb-0.5 border-muted-dark dark:border-muted" />
            <button
              type="button"
              className={twJoin(
                linkClassName,
                "text-sm data-[submitting]:animate-pulse",
              )}
              disabled={componentActioner.state === "submitting"}
              onClick={async (e) => {
                const { currentTarget: button } = e;
                button.dataset.submitting = "";
                await componentActioner.submitAsync(
                  {
                    guildId: guild.id,
                    channelId: component.channelId?.toString(),
                    messageId: component.messageId?.toString(),
                  },
                  {
                    method: "PATCH",
                    action: apiUrl(BRoutes.component(component.id.toString())),
                  },
                );
                delete button.dataset.submitting;
                if (user.discordUser) {
                  setResponsibleId(String(user.discordUser.id));
                  setResponsibleUser({
                    nick: null,
                    user: {
                      id: String(user.discordUser.id),
                      username: user.discordUser.name,
                      global_name: user.discordUser.globalName,
                    },
                  });
                }

                await componentsFetcher.loadAsync(
                  apiUrl(BRoutes.guildComponents(guild.id)),
                );
              }}
            >
              {t("takeResponsibility")}
            </button>
          </div>
        )}
      </div>
      <hr className="border border-gray-500/20 mt-4 mb-1" />
      <p className="text-muted dark:text-muted-dark text-sm font-medium">
        {t("componentEditShiftSkipTip")}
      </p>
      <div className="space-x-1.5 rtl:space-x-reverse mt-4">
        <Link to={`/edit/component/${component.id}`} className="contents">
          <Button discordstyle={ButtonStyle.Link}>{t("edit")}</Button>
        </Link>
        <Button
          discordstyle={ButtonStyle.Danger}
          onClick={async (e) => {
            const callback = async () => {
              await componentActioner.submitAsync(undefined, {
                method: "DELETE",
                action: apiUrl(BRoutes.component(component.id.toString())),
              });
              await componentsFetcher.loadAsync(
                apiUrl(BRoutes.guildComponents(guild.id)),
              );
            };

            if (e.shiftKey) {
              await callback();
              return;
            }

            setConfirm({
              title: t("deleteComponent"),
              children: (
                <>
                  <p>
                    {t("deleteComponentConfirm", {
                      replace: { type: component.data.type },
                    })}
                  </p>
                  <p className="text-muted dark:text-muted-dark text-sm font-medium">
                    {t("shiftSkipTip")}
                  </p>
                  <Button
                    className="mt-4"
                    discordstyle={ButtonStyle.Danger}
                    onClick={async () => {
                      await callback();
                      setConfirm(undefined);
                    }}
                  >
                    {t("delete")}
                  </Button>
                </>
              ),
            });
          }}
        >
          {t("delete")}
        </Button>
      </div>
    </>
  );
};

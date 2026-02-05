import { Popover } from "@base-ui-components/react/popover";
import {
  type APIActionRowComponent,
  type APIButtonComponent,
  type APIComponentInMessageActionRow,
  type APISelectMenuComponent,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import type { TFunction } from "~/types/i18next";
import type {
  CacheManager,
  ResolvableAPIChannel,
  ResolvableAPIGuildMember,
  ResolvableAPIRole,
} from "~/util/cache/CacheManager";
import { cdn, cdnImgAttributes } from "~/util/discord";
import { getUserAvatar } from "~/util/users";
import { Button } from "../Button";
import { CoolIcon } from "../icons/CoolIcon";
import { RoleShield } from "../icons/role";
import { Twemoji } from "../icons/Twemoji";
import { channelIcons } from "./Markdown";
import { AuthorType } from "./Message.client";

type PreviewComponent<T extends APIComponentInMessageActionRow> = React.FC<{
  data: T;
  onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  authorType?: AuthorType;
  cache?: CacheManager;
  t?: TFunction;
}>;

export const PreviewButton: PreviewComponent<APIButtonComponent> = ({
  data,
  onClick,
  authorType,
}) => {
  const nonSendable = authorType
    ? authorType < AuthorType.ApplicationWebhook
    : undefined;

  const button = (
    <Button
      discordstyle={data.style}
      emoji={data.style !== ButtonStyle.Premium ? data.emoji : undefined}
      disabled={data.disabled ?? false}
      className={twJoin("!text-sm", nonSendable ? "hidden" : undefined)}
      onClick={onClick}
    >
      {data.style !== ButtonStyle.Premium ? data.label : `SKU ${data.sku_id}`}
    </Button>
  );
  return data.style === ButtonStyle.Link && data.url !== "" ? (
    <a href={data.url} target="_blank" rel="noreferrer">
      {button}
    </a>
  ) : (
    button
  );
};

const PreviewSelectOption: React.FC<{
  label: string;
  description?: string;
  icon?: React.ReactNode;
}> = ({ label, description, icon }) => {
  return (
    <div className="flex items-center gap-2 last:rounded-b-lg hover:bg-[#F2F2F3] hover:dark:bg-[#43444B] w-full p-2 cursor-pointer">
      {icon}
      <div className="truncate text-sm font-medium">
        <p className="truncate leading-[18px]">{label}</p>
        {description && (
          <p className="truncate text-[#4e5058] dark:text-[#b5bac1] leading-[18px]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

const PreviewMemberSelectOption: React.FC<{
  member: ResolvableAPIGuildMember;
}> = ({ member }) => (
  <PreviewSelectOption
    label={member.nick ?? member.user.global_name ?? member.user.username}
    icon={
      <img
        src={getUserAvatar({
          discordUser: {
            id: BigInt(member.user.id),
            discriminator: null,
            avatar: null,
          },
        })}
        className="w-[22px] h-[22px] shrink-0 rounded-full"
        alt=""
      />
    }
  />
);

const PreviewRoleSelectOption: React.FC<{
  role: ResolvableAPIRole;
}> = ({ role }) => (
  <PreviewSelectOption
    label={role.name}
    icon={
      role.icon ? (
        <img
          {...cdnImgAttributes(32, (size) =>
            // biome-ignore lint/style/noNonNullAssertion: Conditional render
            cdn.roleIcon(role.id, role.icon!, { size }),
          )}
          className="w-[22px] h-[22px] shrink-0 rounded-full object-contain"
          alt={role.name}
        />
      ) : role.unicode_emoji ? (
        <Twemoji
          emoji={role.unicode_emoji}
          className="w-[22px] h-[22px] shrink-0 align-middle"
          spanClassName="contents"
        />
      ) : (
        <RoleShield
          style={{ color: `#${role.color.toString(16)}` }}
          className="mr-2"
        />
      )
    }
  />
);

const PreviewChannelSelectOption: React.FC<{
  channel: ResolvableAPIChannel;
}> = ({ channel }) => (
  <PreviewSelectOption
    label={channel.name ?? ""}
    icon={channelIcons[channel.type]({ className: "mr-2" })}
  />
);

export const PreviewSelect: PreviewComponent<APISelectMenuComponent> = ({
  data,
  onClick,
  authorType,
  cache,
  t,
}) => {
  const shouldLeftPad =
    "options" in data && data.options.filter((o) => o.emoji).length !== 0;
  const nonSendable = authorType
    ? authorType < AuthorType.ActionableWebhook
    : undefined;

  return (
    <Popover.Root>
      <Popover.Trigger
        disabled={data.disabled}
        onClick={(e) => {
          if (onClick) {
            e.preventBaseUIHandler();
            onClick(e);
          } else if (!data.disabled) {
            // e.currentTarget.dataset.open = String(
            //   e.currentTarget.dataset.open === "false",
            // );
          }
        }}
        render={
          <button
            type="button"
            data-type={data.type}
            data-custom-id={data.custom_id}
            className={twJoin(
              "group/trigger",
              "max-w-[400px] mr-4 box-border items-center gap-x-2",
              "rounded-lg p-2 text-left bg-[#ebebeb] dark:bg-[#1e1f22] border border-black/[0.08] dark:border-transparent hover:border-[#c4c9ce] dark:hover:border-[#020202] transition-[border,_opacity] duration-200 font-medium cursor-pointer grid grid-cols-[1fr_auto] items-center w-full disabled:opacity-60 disabled:cursor-not-allowed",
              nonSendable ? "hidden" : undefined,
            )}
          />
        }
      >
        <span className="truncate text-[#5c5e66] dark:text-[#949ba4] leading-none">
          {data.placeholder ?? (t ? t("defaultPlaceholder") : "")}
        </span>
        <CoolIcon
          icon="Chevron_Down"
          className="group-data-[popup-open]/trigger:rotate-180"
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={4} side="bottom" className="z-[35]">
          <Popover.Popup
            className={twJoin(
              "box-border rounded-lg w-[--anchor-width] overflow-y-auto max-h-64",
              "bg-white dark:bg-[#3C3D44] border border-[#e3e5e8] dark:border-[#1e1f22]",
            )}
          >
            {data.type === ComponentType.StringSelect
              ? data.options.map((option, oi) => (
                  <PreviewSelectOption
                    key={`preview-select-option-${oi}-${option.value}`}
                    label={option.label}
                    description={option.description}
                    icon={
                      option.emoji?.id ? (
                        <img
                          src={cdn.emoji(option.emoji.id)}
                          className="w-[22px] h-[22px] shrink-0 object-contain"
                          alt={option.emoji.name}
                        />
                      ) : option.emoji?.name ? (
                        <Twemoji
                          emoji={option.emoji.name}
                          className="w-[22px] h-[22px] shrink-0 align-middle"
                          spanClassName="contents"
                        />
                      ) : shouldLeftPad ? (
                        <div className="w-[22px] shrink-0" />
                      ) : undefined
                    }
                  />
                ))
              : cache &&
                (data.type === ComponentType.UserSelect ? (
                  cache.member
                    .getAll()
                    .map((member) => (
                      <PreviewMemberSelectOption
                        key={`preview-select-${data.type}-option-${member.user.id}`}
                        member={member}
                      />
                    ))
                ) : data.type === ComponentType.RoleSelect ? (
                  cache.role
                    .getAll()
                    .map((role) => (
                      <PreviewRoleSelectOption
                        key={`preview-select-${data.type}-option-${role.id}`}
                        role={role}
                      />
                    ))
                ) : data.type === ComponentType.MentionableSelect ? (
                  <>
                    {cache.role.getAll().map((role) => (
                      <PreviewRoleSelectOption
                        key={`preview-select-${data.type}-option-${role.id}-role`}
                        role={role}
                      />
                    ))}
                    {cache.member.getAll().map((member) => (
                      <PreviewMemberSelectOption
                        key={`preview-select-${data.type}-option-${member.user.id}-user`}
                        member={member}
                      />
                    ))}
                  </>
                ) : data.type === ComponentType.ChannelSelect ? (
                  cache.channel
                    .getAll()
                    .map((channel) => (
                      <PreviewChannelSelectOption
                        key={`preview-select-${data.type}-option-${channel.id}`}
                        channel={channel}
                      />
                    ))
                ) : (
                  <></>
                ))}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
};

export const GenericPreviewComponentInActionRow: PreviewComponent<
  APIComponentInMessageActionRow
> = (props) => {
  switch (props.data.type) {
    case ComponentType.Button:
      return <PreviewButton {...props} data={props.data} />;
    case ComponentType.StringSelect:
    case ComponentType.UserSelect:
    case ComponentType.RoleSelect:
    case ComponentType.MentionableSelect:
    case ComponentType.ChannelSelect:
      return <PreviewSelect {...props} data={props.data} />;
    default:
      return <></>;
  }
};

export const PreviewActionRow: React.FC<{
  component: APIActionRowComponent<APIComponentInMessageActionRow>;
  authorType?: AuthorType;
  cache?: CacheManager;
}> = ({ component: row, authorType, cache }) => {
  const { t } = useTranslation();
  const isAllLinkButtons = !row.components
    .map((c) => c.type === ComponentType.Button && c.style === ButtonStyle.Link)
    .includes(false);

  return (
    <div
      className="flex flex-wrap gap-x-1.5 gap-y-0"
      // data-action-row-index={i}
    >
      {row.components.map((component, ci) => (
        <div key={`action-row-component-${ci}`} className="contents">
          <GenericPreviewComponentInActionRow
            data={component}
            authorType={
              // We shouldn't lie about the author type
              (authorType === undefined ||
                authorType < AuthorType.ApplicationWebhook) &&
              isAllLinkButtons
                ? AuthorType.ApplicationWebhook
                : authorType
            }
            cache={cache}
            t={t}
          />
        </div>
      ))}
    </div>
  );
};

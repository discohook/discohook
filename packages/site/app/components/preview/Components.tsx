import {
  APIButtonComponent,
  APIMessage,
  APIMessageActionRowComponent,
  APISelectMenuComponent,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import {
  CacheManager,
  ResolvableAPIChannel,
  ResolvableAPIGuildMember,
  ResolvableAPIRole,
} from "~/util/cache/CacheManager";
import { cdn, cdnImgAttributes } from "~/util/discord";
import { getUserAvatar } from "~/util/users";
import { Button } from "../Button";
import { CoolIcon } from "../icons/CoolIcon";
import { Twemoji } from "../icons/Twemoji";
import { RoleShield } from "../icons/role";
import { channelIcons } from "./Markdown";
import { AuthorType } from "./Message";

type PreviewComponent<T extends APIMessageActionRowComponent> = React.FC<{
  data: T;
  onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  authorType?: AuthorType;
  cache?: CacheManager;
}>;

export const PreviewButton: PreviewComponent<APIButtonComponent> = ({
  data,
  onClick,
  authorType,
}) => {
  const nonSendable =
    authorType &&
    ((data.style === ButtonStyle.Link &&
      authorType < AuthorType.ApplicationWebhook) ||
      authorType < AuthorType.ActionableWebhook);

  const button = (
    <Button
      discordstyle={data.style}
      emoji={data.emoji}
      disabled={data.disabled ?? false}
      className={`!text-sm ${nonSendable ? "hidden" : ""}`}
      onClick={onClick}
    >
      {data.label}
    </Button>
  );
  return data.style === ButtonStyle.Link ? (
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
    <div className="flex last:rounded-b hover:bg-[#e0e1e5] hover:dark:bg-[#36373d] w-full p-2 cursor-pointer">
      {icon}
      <div className="truncate text-sm font-medium my-auto">
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
        className="w-[22px] h-[22px] mr-2 my-auto shrink-0 rounded-full"
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
          className="w-[22px] h-[22px] mr-2 my-auto shrink-0 rounded-full"
          alt={role.name}
        />
      ) : role.unicode_emoji ? (
        <Twemoji
          emoji={role.unicode_emoji}
          className="w-[22px] h-[22px] mr-2 my-auto shrink-0 align-middle"
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
}) => {
  const { t } = useTranslation();
  const shouldLeftPad =
    "options" in data && data.options.filter((o) => o.emoji).length !== 0;
  const nonSendable = authorType && authorType < AuthorType.ActionableWebhook;

  return (
    <div className="w-[90%] max-w-[400px] mr-4 relative">
      <button
        type="button"
        data-custom-id={data.custom_id}
        data-type={data.type}
        data-open={false}
        className={`peer/select group/select rounded data-[open=true]:rounded-b-none p-2 text-left bg-[#ebebeb] dark:bg-[#1e1f22] border border-black/[0.08] dark:border-transparent hover:border-[#c4c9ce] dark:hover:border-[#020202] transition-[border,_opacity] duration-200 font-medium cursor-pointer grid grid-cols-[1fr_auto] items-center w-full disabled:opacity-60 disabled:cursor-not-allowed ${
          nonSendable ? "hidden" : ""
        }`}
        disabled={data.disabled}
        onClick={(e) => {
          e.currentTarget.dataset.open = String(
            e.currentTarget.dataset.open === "false",
          );
          if (onClick) onClick(e);
        }}
      >
        <span className="truncate text-[#5c5e66] dark:text-[#949ba4] leading-none">
          {data.placeholder ?? t("defaultPlaceholder")}
        </span>
        <div className="flex items-center gap-1">
          <CoolIcon
            icon="Chevron_Down"
            className="group-data-[open=true]/select:rotate-180"
          />
        </div>
      </button>
      <div className="hidden peer-data-[open=true]/select:block absolute left-0 w-full bg-[#f2f3f5] dark:bg-[#2b2d31] rounded-b border border-[#e3e5e8] dark:border-[#1e1f22] overflow-y-auto max-h-64">
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
                      className="w-[22px] h-[22px] mr-2 my-auto shrink-0"
                      alt={option.emoji.name}
                    />
                  ) : option.emoji?.name ? (
                    <Twemoji
                      emoji={option.emoji.name}
                      className="w-[22px] h-[22px] mr-2 my-auto shrink-0 align-middle"
                    />
                  ) : shouldLeftPad ? (
                    <div className="w-[22px] mr-2 shrink-0" />
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
      </div>
    </div>
  );
};

const previewComponentMap = {
  [ComponentType.Button]: PreviewButton,
  [ComponentType.StringSelect]: PreviewSelect,
  [ComponentType.UserSelect]: PreviewSelect,
  [ComponentType.RoleSelect]: PreviewSelect,
  [ComponentType.MentionableSelect]: PreviewSelect,
  [ComponentType.ChannelSelect]: PreviewSelect,
};

export const MessageComponents: React.FC<{
  components: NonNullable<APIMessage["components"]>;
  authorType?: AuthorType;
  cache?: CacheManager;
}> = ({ components, authorType, cache }) => {
  return (
    <div className="grid gap-1 py-[0.125rem]">
      {components.map((row, i) => (
        <div key={`action-row-${i}`} className="flex flex-wrap gap-1">
          {row.components.map((component, ci) => {
            const fc = previewComponentMap[component.type];
            if (fc) {
              return (
                <div
                  key={`action-row-${i}-component-${ci}`}
                  className="contents"
                >
                  {fc({
                    // @ts-ignore
                    data: component,
                    authorType,
                    cache,
                  })}
                </div>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};

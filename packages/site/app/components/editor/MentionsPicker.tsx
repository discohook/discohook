import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import {
  CacheManager,
  ResolutionScope,
  ResolvableAPIChannel,
  ResolvableAPIGuildMember,
  ResolvableAPIRole,
} from "~/util/cache/CacheManager";
import { CoolIcon } from "../icons/CoolIcon";
import { Svg } from "../icons/Svg";
import { TextChannelIcon } from "../icons/channel";
import { channelIcons } from "../preview/Markdown";

export const CategoryIconButton: React.FC<{
  id: string;
  categoryId: string;
}> = ({ categoryId, id }) => {
  return (
    <button
      type="button"
      className="block mx-auto dark:hover:text-white transition"
      onClick={() => {
        const sectionHeader = document.getElementById(`${id}-${categoryId}`);
        if (sectionHeader) {
          sectionHeader.scrollIntoView();
        }
      }}
    >
      {categoryId === "channel" ? (
        <TextChannelIcon />
      ) : categoryId === "role" ? (
        <Svg width={24} height={24}>
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M3.47 5.18c.27-.4.64-.74 1.1-.96l6.09-3.05a3 3 0 0 1 2.68 0l6.1 3.05A2.83 2.83 0 0 1 21 6.75v3.5a14.17 14.17 0 0 1-8.42 12.5c-.37.16-.79.16-1.16 0A14.18 14.18 0 0 1 3 9.77V6.75c0-.57.17-1.11.47-1.57zm2.95 10.3A12.18 12.18 0 0 0 12 20.82a12.18 12.18 0 0 0 5.58-5.32 9.49 9.49 0 0 0-5.11-1.5h-.94c-1.88 0-3.63.55-5.11 1.49zM12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
            clipRule="evenodd"
          />
        </Svg>
      ) : categoryId === "member" ? (
        <Svg width={24} height={24}>
          <path
            fill="currentColor"
            d="M14.5 8a3 3 0 1 0-2.7-4.3c-.2.4.06.86.44 1.12a5 5 0 0 1 2.14 3.08c.01.06.06.1.12.1zm3.94 9.27c.15.43.54.73 1 .73h1.06c.83 0 1.5-.67 1.5-1.5a7.5 7.5 0 0 0-6.5-7.43c-.55-.08-.99.38-1.1.92-.06.3-.15.6-.26.87-.23.58-.05 1.3.47 1.63a9.53 9.53 0 0 1 3.83 4.78zM12.5 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM2 20.5a7.5 7.5 0 0 1 15 0c0 .83-.67 1.5-1.5 1.5a.2.2 0 0 1-.2-.16c-.2-.96-.56-1.87-.88-2.54-.1-.23-.42-.15-.42.1v2.1a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2.1c0-.25-.31-.33-.42-.1-.32.67-.67 1.58-.88 2.54a.2.2 0 0 1-.2.16A1.5 1.5 0 0 1 2 20.5z"
          />
        </Svg>
      ) : (
        <></>
      )}
    </button>
  );
};

export type ActionableMentionScope = ResolutionScope | "special" | "literal";

export const MentionsPicker: React.FC<{
  id: string;
  onMentionClick: (
    mention: {
      id: string;
      scope: ActionableMentionScope;
    },
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
  className?: string;
  cache?: CacheManager;
}> = ({ id, cache, className, onMentionClick }) => {
  const { t } = useTranslation();
  const state = {
    // Three iterations here, gross, maybe reduce in the future
    channel: [
      { id: "guide", name: t("mention.guide"), type: "guide" },
      { id: "browse", name: t("mention.browse"), type: "browse" },
      { id: "customize", name: t("mention.customize"), type: "browse" },
      ...(cache ? cache.channel.getAll() : []),
    ],
    role: [
      { id: "@everyone", name: "everyone", color: 0x5865f2 },
      { id: "@here", name: "here", color: 0x5865f2 },
      ...(cache ? cache.role.getAll() : []),
    ],
    member: cache ? cache.member.getAll() : [],
  };
  const categories = Object.keys(state) as (keyof typeof state)[];

  return (
    <div
      className={twJoin(
        "rounded bg-gray-300 dark:bg-gray-800 w-[385px] h-80 border border-black/5 shadow-md flex flex-col",
        className,
      )}
    >
      <div className="flex grow h-full overflow-hidden">
        <div className="w-10 shrink-0 bg-gray-400 dark:bg-gray-900 overflow-y-auto h-full scrollbar-none space-y-2 p-1 py-2 flex flex-col">
          {categories.map((category) => (
            <CategoryIconButton
              key={`mention-category-${id}-${category}-icon`}
              categoryId={category}
              id={id}
            />
          ))}
        </div>
        <div className="overflow-y-auto flex flex-col grow select-none">
          <div className="grow px-1.5 pb-1">
            {categories.map((categoryId) => (
              <div
                key={`mention-category-${id}-${categoryId}-body`}
                className="pt-3 first:pt-1"
              >
                <div
                  id={`${id}-${categoryId}`}
                  className="uppercase text-xs font-semibold pt-1 mb-1 ltr:ml-1 rtl:mr-1 flex"
                >
                  <p className="my-auto">{t(`${categoryId}s`)}</p>
                </div>
                <div className="flex flex-col gap-px">
                  {state[categoryId as keyof typeof state].map((resource) => {
                    let mentionId: string | undefined;
                    let label: React.ReactNode | undefined;
                    let sublabel: React.ReactNode | undefined;
                    let icon: React.ReactNode | undefined;
                    let scope = categoryId as ActionableMentionScope;
                    if (categoryId === "channel") {
                      const channel = resource as ResolvableAPIChannel;
                      mentionId = channel.id;
                      label = channel.name;
                      if (["guide", "browse"].includes(channel.type)) {
                        scope = "special";
                      }
                      icon = channelIcons[channel.type]?.({
                        className: "ltr:ml-1 rtl:mr-1 -mr-0.5 h-5 w-5",
                      });
                    } else if (categoryId === "member") {
                      const member = resource as ResolvableAPIGuildMember;
                      mentionId = member.user.id;
                      label =
                        member.nick ??
                        member.user.global_name ??
                        member.user.username;
                      if (label !== member.user.username) {
                        sublabel = member.user.username;
                      }
                      icon = (
                        <CoolIcon
                          icon="Mention"
                          className="text-xl ltr:ml-1 rtl:mr-1"
                        />
                      );
                    } else if (categoryId === "role") {
                      const role = resource as ResolvableAPIRole;
                      mentionId = role.id;
                      if (role.id.startsWith("@")) {
                        scope = "literal";
                      }
                      label = (
                        <span
                          style={{
                            color: `#${role.color.toString(16)}`,
                          }}
                          className="block"
                        >
                          @{role.name}
                        </span>
                      );
                    }
                    return (
                      <button
                        type="button"
                        onClick={(event) => {
                          if (!mentionId) return;
                          onMentionClick({ id: mentionId, scope }, event);
                        }}
                        className="rounded p-0.5 flex hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                      >
                        <div className="ltr:mr-1.5 rtl:ml-1.5">{icon}</div>
                        <p className="my-auto truncate">{label}</p>
                        {sublabel && (
                          <p className="my-auto ltr:ml-auto ltr:mr-1 rtl:mr-auto rtl:ml-1 text-sm truncate text-primary-400 dark:text-gray-500">
                            {sublabel}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import { twJoin } from "tailwind-merge";
import {
  CacheManager,
  ResolutionScope,
  ResolvableAPIChannel,
  ResolvableAPIGuildMember,
  ResolvableAPIRole,
} from "~/util/cache/CacheManager";
import { CoolIcon } from "../icons/CoolIcon";
import { channelIcons } from "../preview/Markdown";

export const CategoryIconButton: React.FC<{
  id: string;
  categoryId: string;
}> = ({ categoryId, id }) => {
  return (
    <button
      type="button"
      className="block mx-auto"
      onClick={() => {
        const sectionHeader = document.getElementById(`${id}-${categoryId}`);
        if (sectionHeader) {
          sectionHeader.scrollIntoView();
        }
      }}
    >
      x
    </button>
  );
};

export type ActionableMentionScope = ResolutionScope | "special";

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
  const state = {
    // Three iterations here, gross, maybe reduce in the future
    channel: [
      { id: "guide", name: "Server Guide", type: "guide" },
      { id: "browse", name: "Browse Channels", type: "browse" },
      { id: "customize", name: "Channels & Roles", type: "browse" },
      ...(cache
        ? (Object.entries(cache.state)
            .filter(
              (entry) => entry[0].startsWith("channel:") && Boolean(entry[1]),
            )
            .map((entry) => entry[1]) as ResolvableAPIChannel[])
        : []),
    ],
    role: cache
      ? (Object.entries(cache.state)
          .filter((entry) => entry[0].startsWith("role:") && Boolean(entry[1]))
          .map((entry) => entry[1]) as ResolvableAPIRole[])
      : [],
    member: cache
      ? (Object.entries(cache.state)
          .filter(
            (entry) => entry[0].startsWith("member:") && Boolean(entry[1]),
          )
          .map((entry) => entry[1]) as ResolvableAPIGuildMember[])
      : [],
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
        <div className="w-10 shrink-0 bg-gray-400 dark:bg-gray-900 overflow-y-auto h-full scrollbar-none space-y-1 p-1 py-2 flex flex-col">
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
                  className="uppercase text-xs font-semibold pt-1 mb-1 ml-1 flex"
                >
                  {/* <Twemoji
                      emoji={categoryToEmoji[categoryId]}
                      className="my-auto mr-1.5 grayscale"
                    /> */}
                  <p className="my-auto">{categoryId}s</p>
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
                        className: "ml-1 -mr-0.5 h-5 w-5",
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
                        <CoolIcon icon="Mention" className="text-xl ml-1" />
                      );
                    } else if (categoryId === "role") {
                      const role = resource as ResolvableAPIRole;
                      mentionId = role.id;
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
                        <div className="mr-1.5">{icon}</div>
                        <p className="my-auto truncate">{label}</p>
                        {sublabel && (
                          <p className="my-auto ml-auto mr-1 text-sm truncate text-primary-400 dark:text-gray-500">
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
          {/*hoverEmoji && (
            <div className="sticky bottom-0 left-0 w-full bg-gray-400 dark:bg-gray-900 flex items-center px-4 py-2">
              {hoverEmoji.keywords.includes("discord") ? (
                <img
                  loading="lazy"
                  src={cdn.emoji(
                    hoverEmoji.skin.native,
                    hoverEmoji.keywords.includes("animated") ? "gif" : "webp",
                  )}
                  alt={hoverEmoji.name}
                  className="h-7 my-auto shrink-0 !align-bottom"
                />
              ) : (
                <Twemoji
                  emoji={hoverEmoji.skin.native}
                  className="h-7 my-auto shrink-0 !align-bottom"
                  title={hoverEmoji.id}
                  loading="lazy"
                />
              )}
              <p className="ml-2 text-base font-semibold my-auto truncate">
                :
                {hoverEmoji.keywords.includes("discord")
                  ? hoverEmoji.name
                  : hoverEmoji.id}
                :
              </p>
            </div>
              )*/}
        </div>
      </div>
    </div>
  );
};

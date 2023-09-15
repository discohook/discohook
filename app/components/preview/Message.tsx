import { APIWebhook } from "discord-api-types/v10";
import { QueryData } from "~/types/QueryData";
import { cdn } from "~/util/discord";

export const Message: React.FC<{
  message: QueryData["messages"][number]["data"];
  webhook?: APIWebhook;
  compact?: boolean;
  theme?: "light" | "dark";
}> = ({ message, webhook }) => {
  const username = message.author?.name ?? webhook?.name ?? "Boogiehook",
    avatarUrl =
      message.author?.icon_url ??
      (webhook?.avatar
        ? cdn.avatar(webhook.id, webhook.avatar, { size: 64 })
        : cdn.defaultAvatar(1)),
    badge: string | undefined = "BOT";

  return (
    <div className="flex">
      <div className="hidden sm:block w-fit shrink-0">
        <img
          className="rounded-full mr-3 h-10 w-10 cursor-pointer hover:shadow-lg active:translate-y-px"
          src={avatarUrl}
          alt={username}
        />
      </div>
      <div className="grow">
        <p className="font-medium leading-none h-4">
          <span className="hover:underline cursor-pointer underline-offset-1 decoration-1">{username}</span>
          {badge && (
            <span className="ml-1 mt-[0.75px] text-[10px] rounded px-1.5 py-px bg-blurple text-white items-center inline-flex h-4">{badge}</span>
          )}
        </p>
      </div>
    </div>
  );
};

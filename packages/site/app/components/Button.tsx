import { APIMessageComponentEmoji, ButtonStyle } from "discord-api-types/v10";
import { cdn } from "~/util/discord";
import { CoolIcon } from "./CoolIcon";
import { Twemoji } from "./Twemoji";

export const Button = (
  props: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & {
    discordstyle?: ButtonStyle;
    emoji?: APIMessageComponentEmoji;
  }
) => {
  return (
    <button
      {...props}
      className={`rounded font-medium text-base min-h-[36px] max-h-9 py-0 px-[14px] min-w-[60px] text-white transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex ${
        !props.discordstyle || props.discordstyle === ButtonStyle.Primary
          ? "bg-blurple-500 hover:bg-blurple-600 active:bg-blurple-700"
          : [ButtonStyle.Link, ButtonStyle.Secondary].includes(
              props.discordstyle
            )
          ? "bg-[#6d6f78] hover:bg-[#4e5058] dark:bg-[#4e5058] hover:dark:bg-[#6d6f78]"
          : props.discordstyle === ButtonStyle.Danger
          ? "bg-[#da373c] hover:bg-[#a12828]"
          : props.discordstyle === ButtonStyle.Success
          ? "bg-[#248046] hover:bg-[#15562b] dark:bg-[#248046] dark:hover:bg-[#1a6334]"
          : ""
      } ${props.className ?? ""}`}
    >
      {props.emoji &&
        (props.emoji.id ? (
          <div className="mr-1 aspect-square my-auto h-7">
            <img
              src={cdn.emoji(
                props.emoji.id,
                props.emoji.animated ? "gif" : "webp"
              )}
              alt={props.emoji.name}
              className="h-full w-full"
            />
          </div>
        ) : (
          <div className="mr-1 aspect-square my-auto h-7 flex">
            <div className="m-auto">
              <Twemoji emoji={props.emoji.name!} className="h-[22px] !align-bottom" />
            </div>
          </div>
        ))}
      <div className={props.emoji ? "my-auto" : "m-auto"}>{props.children}</div>
      {props.discordstyle === ButtonStyle.Link && (
        <CoolIcon icon="External_Link" className="ml-1.5 my-auto" />
      )}
    </button>
  );
};

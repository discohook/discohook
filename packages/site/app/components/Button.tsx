import { APIMessageComponentEmoji, ButtonStyle } from "discord-api-types/v10";
import { twMerge } from "tailwind-merge";
import { cdn } from "~/util/discord";
import { CoolIcon } from "./icons/CoolIcon";
import { Twemoji } from "./icons/Twemoji";

export const Button = (
  props: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & {
    discordstyle?: ButtonStyle;
    emoji?: APIMessageComponentEmoji;
  },
) => {
  return (
    <button
      type="button"
      {...props}
      className={twMerge(
        "rounded font-medium text-base min-h-[36px] max-h-9 py-0 px-[14px] min-w-[60px] text-white transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex shrink-0",
        !props.discordstyle || props.discordstyle === ButtonStyle.Primary
          ? "bg-blurple-500 hover:bg-[#4752c4] active:bg-[#3c45a5]"
          : [ButtonStyle.Link, ButtonStyle.Secondary].includes(
                props.discordstyle,
              )
            ? "bg-[#6d6f78] hover:bg-[#4e5058] dark:bg-[#4e5058] hover:dark:bg-[#6d6f78]"
            : props.discordstyle === ButtonStyle.Danger
              ? "bg-[#da373c] hover:bg-[#a12828]"
              : props.discordstyle === ButtonStyle.Success
                ? "bg-[#248046] hover:bg-[#15562b] dark:bg-[#248046] dark:hover:bg-[#1a6334]"
                : "",
        props.className ?? "",
      )}
    >
      {props.emoji &&
        (props.emoji.id ? (
          <div
            className={`aspect-square h-[22px] my-auto ${
              props.children ? "ltr:mr-1 rtl:ml-1" : "mx-auto"
            }`}
          >
            <img
              src={cdn.emoji(
                props.emoji.id,
                props.emoji.animated ? "gif" : "webp",
              )}
              alt={props.emoji.name}
              className="max-h-full max-w-full"
            />
          </div>
        ) : (
          <div className="ltr:mr-1 rtl:ml-1 aspect-square my-auto h-7 flex">
            <div className="m-auto">
              <Twemoji
                // biome-ignore lint/style/noNonNullAssertion: Must have name if not an ID
                emoji={props.emoji.name!}
                className="h-[22px] !align-bottom"
              />
            </div>
          </div>
        ))}
      <div className={props.emoji ? "my-auto" : "m-auto"}>{props.children}</div>
      {props.discordstyle === ButtonStyle.Link && (
        <CoolIcon
          icon="External_Link"
          className="ltr:ml-1.5 rtl:mr-1.5 my-auto"
        />
      )}
    </button>
  );
};

export const TextButton = (
  props: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >,
) => {
  const { className, ...newProps } = props;
  return (
    <button
      type="button"
      {...newProps}
      className={twMerge(
        "font-medium hover:underline my-auto cursor-pointer ltr:mr-4 rtl:ml-4",
        className,
      )}
    />
  );
};

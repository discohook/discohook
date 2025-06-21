import {
  type APIMessageComponentEmoji,
  ButtonStyle,
} from "discord-api-types/v10";
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
        "border border-[#ffffff14] rounded-lg font-medium text-base h-8 py-0 px-4 min-w-[60px] text-white transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex shrink-0",
        !props.discordstyle || props.discordstyle === ButtonStyle.Primary
          ? "bg-blurple-500 hover:bg-blurple-600 active:bg-blurple-700"
          : [ButtonStyle.Link, ButtonStyle.Secondary].includes(
                props.discordstyle,
              )
            ? // Secondary button colors are different for the Dark and Onyx themes, currently Light and Ash are implemented
              "bg-[#97979f29] hover:bg-[#97979f47] dark:bg-[#97979f1f] hover:dark:bg-[#97979f33] active:bg-[#83838b14] active:dark:bg-[#50505a4d] text-[#0c0c0e] dark:text-[#ebebed] border-[#97979f33] dark:border-[#97979f0a]"
            : props.discordstyle === ButtonStyle.Danger
              ? "bg-[#d22d39] hover:bg-[#b42831] active:bg-[#a4232c]"
              : props.discordstyle === ButtonStyle.Success
                ? "bg-[#00863a] hover:bg-[#047e37] active:bg-[#057332]"
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

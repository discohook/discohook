import {
  type APIMessageComponentEmoji,
  ButtonStyle,
} from "discord-api-types/v10";
import { twJoin, twMerge } from "tailwind-merge";
import { cdn } from "~/util/discord";
import { CoolIcon } from "./icons/CoolIcon";
import { Twemoji } from "./icons/Twemoji";
import { LoadingDots } from "./LoadingDots";

export const Button = ({
  loading,
  discordstyle: style,
  emoji,
  ...props
}: React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  discordstyle?: ButtonStyle;
  emoji?: APIMessageComponentEmoji;
  loading?: boolean;
}) => (
  <button
    type="button"
    {...props}
    className={twMerge(
      "relative border border-[#ffffff14] rounded-lg font-medium text-base h-8 py-0 px-4 min-w-[60px] max-w-full text-white transition shrink-0",
      loading ? "" : "disabled:opacity-50 disabled:cursor-not-allowed",
      !style || style === ButtonStyle.Primary
        ? "bg-blurple-500 hover:bg-blurple-600 active:bg-blurple-700"
        : [ButtonStyle.Link, ButtonStyle.Secondary].includes(style)
          ? // Secondary button colors are different for the Dark and Onyx themes, currently Light and Ash are implemented
            "bg-[#97979f29] hover:bg-[#97979f47] dark:bg-[#97979f1f] hover:dark:bg-[#97979f33] active:bg-[#83838b14] active:dark:bg-[#50505a4d] text-[#0c0c0e] dark:text-[#ebebed] border-[#97979f33] dark:border-[#97979f0a]"
          : style === ButtonStyle.Danger
            ? "bg-[#d22d39] hover:bg-[#b42831] active:bg-[#a4232c]"
            : style === ButtonStyle.Success
              ? "bg-[#00863a] hover:bg-[#047e37] active:bg-[#057332]"
              : "",
      props.className ?? "",
    )}
  >
    <div
      className={twJoin(
        "inline-flex max-w-full",
        loading ? "invisible" : undefined,
      )}
    >
      {emoji &&
        (emoji.id ? (
          <div
            className={`aspect-square h-[22px] my-auto ${
              props.children ? "me-1" : "mx-auto"
            }`}
          >
            <img
              src={cdn.emoji(emoji.id, emoji.animated ? "gif" : "webp")}
              alt={emoji.name}
              className="max-h-full max-w-full"
            />
          </div>
        ) : (
          <div className="me-1 aspect-square my-auto h-7 flex">
            <div className="m-auto">
              <Twemoji
                // biome-ignore lint/style/noNonNullAssertion: Must have name if not an ID
                emoji={emoji.name!}
                className="h-[22px] !align-bottom"
              />
            </div>
          </div>
        ))}
      <div className={twJoin(emoji ? "my-auto" : "m-auto", "truncate")}>
        {props.children}
      </div>
      {style === ButtonStyle.Link && (
        <CoolIcon
          icon="External_Link"
          className="ltr:ml-1.5 rtl:mr-1.5 my-auto"
        />
      )}
    </div>
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center">
        <LoadingDots />
      </div>
    )}
  </button>
);

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
        "font-medium hover:underline my-auto cursor-pointer me-4",
        className,
      )}
    />
  );
};

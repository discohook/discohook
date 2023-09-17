import { ButtonStyle } from "discord-api-types/v10";
import { CoolIcon } from "./CoolIcon";

export const Button = (
  props: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & {
    discordstyle?: ButtonStyle;
    emoji?: string;
  }
) => {
  return (
    <button
      {...props}
      className={`rounded font-medium text-base min-h-[36px] max-h-9 py-0 px-[14px] min-w-[60px] text-white transition disabled:opacity-40 disabled:cursor-not-allowed ${
        !props.discordstyle || props.discordstyle === ButtonStyle.Primary
          ? "bg-blurple-500 hover:bg-blurple-600 active:bg-blurple-700"
          : [ButtonStyle.Link, ButtonStyle.Secondary].includes(
              props.discordstyle
            )
          ? "bg-[#6d6f78] hover:bg-[#4e5058] dark:bg-[#4e5058] dark:hover:bg-[#6d6f78]"
          : ""
      } ${props.className ?? ""}`}
    >
      {props.children}
      {props.discordstyle === ButtonStyle.Link && (
        <CoolIcon icon="External_Link" className="ml-1.5" />
      )}
    </button>
  );
};

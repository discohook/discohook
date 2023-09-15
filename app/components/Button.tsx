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
  let basicStyle = "bg-blurple-500 hover:bg-blurple-600 active:bg-blurple-700";
  switch (props.discordstyle) {
    case ButtonStyle.Link:
    case ButtonStyle.Secondary: {
      basicStyle = "bg-gray-700 hover:bg-gray-600";
      break;
    }
  }

  return (
    <button
      {...props}
      className={`rounded font-medium text-base min-h-[36px] max-h-9 py-0 px-[14px] min-w-[60px] text-white ${basicStyle} transition disabled:opacity-40 disabled:cursor-not-allowed ${
        props.className ?? ""
      }`}
    >
      {props.children}
      {props.discordstyle === ButtonStyle.Link && (
        <CoolIcon icon="External_Link" className="ml-1.5" />
      )}
    </button>
  );
};

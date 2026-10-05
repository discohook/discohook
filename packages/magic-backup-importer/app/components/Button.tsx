export enum ButtonStyle {
  Primary = 1,
  Secondary = 2,
}

export const Button = (
  props: React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & { discordStyle?: ButtonStyle },
) => {
  const { discordStyle, ...rest } = props;
  let color = "bg-blurple-500 hover:bg-blurple-600 active:bg-blurple-700";
  if (discordStyle === ButtonStyle.Secondary) {
    color =
      "bg-[#97979f29] hover:bg-[#97979f47] dark:bg-[#97979f1f] hover:dark:bg-[#97979f33] active:bg-[#83838b14] active:dark:bg-[#50505a4d] text-[#0c0c0e] dark:text-[#ebebed] border-[#97979f33] dark:border-[#97979f0a]";
  }

  return (
    <button
      type="button"
      {...rest}
      className={`border border-[#ffffff14] rounded-lg font-medium text-base min-h-[36px] max-h-9 py-0 px-[14px] min-w-[60px] text-white transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex ${color} ${
        rest.className ?? ""
      }`}
    />
  );
};

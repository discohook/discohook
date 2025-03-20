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
    color = "bg-[#4e5058] hover:bg-[#6d6f78]";
  }

  return (
    <button
      type="button"
      {...rest}
      className={`rounded font-medium text-base min-h-[36px] max-h-9 py-0 px-[14px] min-w-[60px] text-white transition disabled:opacity-40 disabled:cursor-not-allowed inline-flex ${color} ${
        rest.className ?? ""
      }`}
    />
  );
};

import { ButtonStyle } from "discord-api-types/v10";
import { twJoin, twMerge } from "tailwind-merge";

const Pip = (props: { className?: string; parentStyle?: ButtonStyle }) => (
  <span
    style={{
      // discord var(--text-default) - want to replace with an actual tw var
      // @ts-expect-error ts hates the var
      "--white-dots": "oklab(0.952693 0.000792831 -0.00253612)",
      "--black-dots": "rgb(104, 104, 104)",
    }}
    className={twJoin(
      props.parentStyle === ButtonStyle.Link ||
        props.parentStyle === ButtonStyle.Secondary
        ? ["bg-[--black-dots]", "dark:bg-[--white-dots]"]
        : "bg-[--white-dots]",
      "inline-block size-[--loading-dots-size] rounded-full mx-0.5",
      "animate-[loading-dots] [animation-duration:1.4s] [animation-iteration-count:infinite] [animation-fill-mode:both]",
      "origin-center will-change-[opacity,_transform]",
      props.className,
    )}
  />
);

export const LoadingDots = (props: {
  className?: string;
  parentStyle?: ButtonStyle;
}) => {
  return (
    <div
      className={twMerge(
        "items-center inline-flex [--loading-dots-size:5px]",
        props.className,
        "child",
      )}
    >
      <Pip parentStyle={props.parentStyle} />
      <Pip parentStyle={props.parentStyle} className="[animation-delay:0.2s]" />
      <Pip parentStyle={props.parentStyle} className="[animation-delay:0.4s]" />
    </div>
  );
};

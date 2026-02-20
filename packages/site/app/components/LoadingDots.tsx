import { twJoin, twMerge } from "tailwind-merge";

const Pip = (props: { className?: string }) => (
  <span
    className={twJoin(
      // discord var(--text-default) - want to replace with an actual tw var
      "bg-[oklab(0.952693_0.000792831_-0.00253612)]",
      "inline-block size-[--loading-dots-size] rounded-full mx-0.5",
      "animate-[loading-dots] [animation-duration:1.4s] [animation-iteration-count:infinite] [animation-fill-mode:both]",
      "origin-center will-change-[opacity,_transform]",
      props.className,
    )}
  />
);

export const LoadingDots = (props: { className?: string }) => {
  return (
    <div
      className={twMerge(
        "items-center inline-flex [--loading-dots-size:5px]",
        props.className,
        "child",
      )}
    >
      <Pip />
      <Pip className="[animation-delay:0.2s]" />
      <Pip className="[animation-delay:0.4s]" />
    </div>
  );
};

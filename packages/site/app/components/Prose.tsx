import { twMerge } from "tailwind-merge";

export const Prose: React.FC<
  React.PropsWithChildren & { className?: string }
> = ({ children, className }) => (
  <div className={twMerge("mx-auto max-w-5xl p-8", className)}>{children}</div>
);

import { twJoin } from "tailwind-merge";

/** For mui/base-ui switches */
export const switchStyles = {
  root: twJoin(
    "relative flex appearance-none m-0 p-[0.15rem] w-10 h-6 rounded-full",
    "border-none bg-gray-300 dark:bg-gray-600 data-[checked]:bg-blurple",
    "transition",
  ),
  thumb: twJoin(
    "aspect-square h-full rounded-full bg-white",
    "data-[checked]:translate-x-4 transition",
  ),
};

import type { Popover } from "@base-ui-components/react/popover";
import { twJoin } from "tailwind-merge";

export const popoverStyles = {
  popup: (state: Popover.Popup.State) =>
    twJoin(
      "transition",
      state.transitionStatus === "starting" ||
        state.transitionStatus === "ending"
        ? "opacity-0 scale-90"
        : undefined,
    ),
};

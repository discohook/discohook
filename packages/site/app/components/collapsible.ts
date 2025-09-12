import { twJoin } from "tailwind-merge";

// generic styles used for allowed mentions modal, panel also used in editor
export const collapsibleStyles = {
  root: "rounded-lg py-2 px-3 bg-gray-200 dark:bg-gray-800",
  trigger: "group/trigger flex items-center gap-2 w-full",
  panel: twJoin(
    "flex flex-col justify-end",
    "overflow-hidden transition-all",
    "h-[--collapsible-panel-height] data-[starting-style]:h-0 data-[ending-style]:h-0",
    "space-y-2",
  ),
  editorPanel: "",
};

collapsibleStyles.editorPanel = twJoin(
  collapsibleStyles.panel,
  "space-y-0 duration-300",
);

import {
  APISeparatorComponent,
  SeparatorSpacingSize,
} from "discord-api-types/v10";
import { twJoin } from "tailwind-merge";

export const PreviewSeparator: React.FC<{
  component: APISeparatorComponent;
}> = ({ component }) => (
  <hr
    className={twJoin(
      "rounded",
      // default is true
      !component.divider ? "border-transparent" : "border-gray-500/20",
      // Small spacing = 0 height; let the row gap create padding
      component.spacing === SeparatorSpacingSize.Large ? "my-2" : undefined,
    )}
  />
);

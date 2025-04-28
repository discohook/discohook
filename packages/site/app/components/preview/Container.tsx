import {
  type APIContainerComponent,
  ComponentType,
} from "discord-api-types/v10";
import { twJoin } from "tailwind-merge";
import { SetImageModalData } from "~/modals/ImageModal";
import { DraftFile } from "~/routes/_index";
import { APIMessageTopLevelComponent } from "~/types/QueryData";
import { CacheManager } from "~/util/cache/CacheManager";
import { decimalToHex } from "../editor/ColorPicker";
import { PreviewActionRow } from "./ActionRow";
import { PreviewFile } from "./File";
import { PreviewMediaGallery } from "./MediaGallery";
import { PreviewSection } from "./Section";
import { PreviewSeparator } from "./Separator";
import { PreviewTextDisplay } from "./TextDisplay";

export interface TopLevelComponentPreviewProps {
  component: APIMessageTopLevelComponent;
  files?: DraftFile[];
  cache: CacheManager | undefined;
  setImageModalData?: SetImageModalData;
  cdn?: string;
}

export const AutoTopLevelComponentPreview = (
  props: TopLevelComponentPreviewProps,
) => {
  const { component } = props;
  switch (component.type) {
    case ComponentType.ActionRow:
      return <PreviewActionRow component={component} />;
    case ComponentType.Container:
      return <PreviewContainer {...props} component={component} />;
    case ComponentType.File:
      return <PreviewFile {...props} component={component} />;
    case ComponentType.MediaGallery:
      return <PreviewMediaGallery {...props} component={component} />;
    case ComponentType.Section:
      return <PreviewSection {...props} component={component} />;
    case ComponentType.Separator:
      return <PreviewSeparator component={component} />;
    case ComponentType.TextDisplay:
      return <PreviewTextDisplay {...props} component={component} />;
    default:
      return <></>;
  }
};

export const PreviewContainer: React.FC<{
  component: APIContainerComponent;
  files?: DraftFile[];
  cache: CacheManager | undefined;
  setImageModalData?: SetImageModalData;
  cdn?: string;
}> = (props) => {
  const { component: container } = props;
  return (
    <div>
      <div
        data-type={container.type}
        className={twJoin(
          "rounded-lg flex flex-col gap-2 overflow-hidden p-4",
          "dark:text-gray-100 bg-white dark:bg-background-secondary-dark border border-[#E2E2E4] dark:border-[#434349]",
          container.accent_color ? "border-l-4" : undefined,
          "group/parent",
        )}
        style={{
          ...(typeof container.accent_color === "number"
            ? { borderLeftColor: decimalToHex(container.accent_color) }
            : undefined),
          maxWidth: 520,
        }}
      >
        {container.components.map((component, ci) => (
          <AutoTopLevelComponentPreview
            key={`container-child-${ci}`}
            {...props}
            component={component}
          />
        ))}
      </div>
    </div>
  );
};

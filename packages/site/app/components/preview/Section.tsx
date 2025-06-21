import { type APISectionComponent, ComponentType } from "discord-api-types/v10";
import { twJoin } from "tailwind-merge";
import type { SetImageModalData } from "~/modals/ImageModal";
import type { DraftFile } from "~/routes/_index";
import type { CacheManager } from "~/util/cache/CacheManager";
import { PreviewButton } from "./ActionRow";
import { getImageUri } from "./Embed";
import { PreviewTextDisplay } from "./TextDisplay";

export const PreviewSection: React.FC<{
  component: APISectionComponent;
  files?: DraftFile[];
  cache: CacheManager | undefined;
  setImageModalData?: SetImageModalData;
}> = ({ component, files, cache, setImageModalData }) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-3 justify-between">
        <div className="flex flex-col gap-y-1">
          {component.components.map((child, i) =>
            child.type === ComponentType.TextDisplay ? (
              <PreviewTextDisplay component={child} cache={cache} />
            ) : (
              <></>
            ),
          )}
        </div>
        <div className="flex items-start">
          {component.accessory.type === ComponentType.Thumbnail ? (
            <div
              className={twJoin(
                "[--thumbnail-size:85px] aspect-square rounded-lg overflow-auto",
                "h-[--thumbnail-size] max-h-[--thumbnail-size] max-w-[--thumbnail-size] w-[--thumbnail-size]",
              )}
            >
              <div className="flex flex-auto [flex-flow:row_nowrap] h-full w-full">
                <button
                  type="button"
                  className="contents"
                  onClick={() => {
                    if (
                      setImageModalData &&
                      // re-enforce type check, this should never be false
                      component.accessory.type === ComponentType.Thumbnail
                    ) {
                      setImageModalData({
                        images: [
                          {
                            url: getImageUri(
                              component.accessory.media.url,
                              files,
                            ),
                            alt: component.accessory.description ?? undefined,
                          },
                        ],
                        startIndex: 0,
                      });
                    }
                  }}
                >
                  <img
                    className="block max-h-inherit m-auto w-[170px] h-full cursor-pointer object-cover"
                    src={getImageUri(component.accessory.media.url, files)}
                    alt=""
                  />
                </button>
              </div>
            </div>
          ) : component.accessory.type === ComponentType.Button ? (
            <div
              className={twJoin("max-w-[calc(50%_-_0.75rem)] items-start flex")}
            >
              <PreviewButton data={component.accessory} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

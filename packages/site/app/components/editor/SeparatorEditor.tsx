import {
  type APIContainerComponent,
  type APISeparatorComponent,
  SeparatorSpacingSize,
} from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import type { QueryData } from "~/types/QueryData";
import type { DragManager } from "~/util/drag";
import { Checkbox } from "../Checkbox";
import { useError } from "../Error";
import { TopLevelComponentEditorContainer } from "./TopLevelComponentEditor";

export const SeparatorEditor: React.FC<{
  message: QueryData["messages"][number];
  component: APISeparatorComponent;
  parent: APIContainerComponent | undefined;
  index: number;
  data: QueryData;
  setData: React.Dispatch<QueryData>;
  drag?: DragManager;
  open?: boolean;
}> = ({ message, component, parent, index: i, data, setData, drag, open }) => {
  const { t } = useTranslation();
  const [error] = useError(t);

  return (
    <TopLevelComponentEditorContainer
      t={t}
      message={message}
      component={component}
      parent={parent}
      index={i}
      data={data}
      setData={setData}
      drag={drag}
      open={open}
    >
      {error}
      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium cursor-default">
            {t("separatorSize")}
          </p>
          <div className="relative h-8 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700">
            <div
              className={twJoin(
                "absolute rounded-lg bg-blurple h-6 w-[calc(50%_-_0.25rem)] transition-all top-[3px]",
                component.spacing === SeparatorSpacingSize.Large
                  ? "left-1/2"
                  : "left-1",
              )}
            />
            <div className="absolute top-0 left-0 w-full h-full flex z-10">
              <button
                type="button"
                className={twJoin(
                  "my-auto w-1/2 text-sm grow transition-all",
                  component.spacing === SeparatorSpacingSize.Small ||
                    component.spacing === undefined
                    ? "text-white font-medium"
                    : undefined,
                )}
                onClick={() => {
                  component.spacing = SeparatorSpacingSize.Small;
                  setData({ ...data });
                }}
              >
                {t("small")}
              </button>
              <button
                type="button"
                className={twJoin(
                  "my-auto w-1/2 text-sm grow transition-all",
                  component.spacing === SeparatorSpacingSize.Large
                    ? "text-white font-medium"
                    : undefined,
                )}
                onClick={() => {
                  component.spacing = SeparatorSpacingSize.Large;
                  setData({ ...data });
                }}
              >
                {t("large")}
              </button>
            </div>
          </div>
        </div>
        <Checkbox
          label={t("separatorLine")}
          checked={component.divider ?? true}
          onCheckedChange={(checked) => {
            component.divider = checked;
            setData({ ...data });
          }}
        />
      </div>
    </TopLevelComponentEditorContainer>
  );
};

import { Slider } from "@base-ui-components/react/slider";
import {
  type APIContainerComponent,
  APISeparatorComponent,
  SeparatorSpacingSize,
} from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import { getQdMessageId } from "~/routes/_index";
import type { QueryData } from "~/types/QueryData";
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
  open?: boolean;
}> = ({ message, component, parent, index: i, data, setData, open }) => {
  const { t } = useTranslation();
  const mid = getQdMessageId(message);
  const [error, setError] = useError(t);

  return (
    <TopLevelComponentEditorContainer
      t={t}
      message={message}
      component={component}
      parent={parent}
      index={i}
      data={data}
      setData={setData}
      open={open}
    >
      {error}
      <div className="space-y-2">
        <Checkbox
          label={t("separatorLine")}
          checked={component.divider ?? true}
          onChange={({ currentTarget }) => {
            component.divider = currentTarget.checked;
            setData({ ...data });
          }}
        />
        <div>
          <p className="text-sm font-medium cursor-default">
            {t("separatorSize")}
          </p>
          <Slider.Root
            className="group/range"
            value={component.spacing ?? SeparatorSpacingSize.Small}
            min={SeparatorSpacingSize.Small}
            max={SeparatorSpacingSize.Large}
            onValueChange={(value) => {
              component.spacing = value as SeparatorSpacingSize;
              setData({ ...data });
            }}
          >
            <Slider.Control className="flex items-center w-full pr-2 space-x-4 touch-none select-none h-4">
              {/* <p className="text-sm my-auto cursor-default text-muted dark:text-muted-dark">
                {t("small")}
              </p> */}
              <Slider.Track className="my-auto bg-gray-100 dark:bg-gray-700 h-1 group-hover/range:h-1.5 w-full rounded select-none transition-[height]">
                <Slider.Indicator className="rounded bg-blurple select-none" />
                <Slider.Thumb className="w-3 h-3 group-hover/range:w-4 group-hover/range:h-4 rounded-full bg-white outline outline-1 outline-gray-50 cursor-ew-resize select-none transition-[height,width]" />
              </Slider.Track>
              {/* <p className="text-sm my-auto cursor-default text-muted dark:text-muted-dark">
                {t("large")}
              </p> */}
            </Slider.Control>
          </Slider.Root>
        </div>
      </div>
    </TopLevelComponentEditorContainer>
  );
};

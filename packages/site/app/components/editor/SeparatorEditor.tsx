import {
  type APIContainerComponent,
  type APISeparatorComponent,
  SeparatorSpacingSize,
} from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import type { QueryData } from "~/types/QueryData";
import type { DragManager } from "~/util/drag";
import { Checkbox } from "../Checkbox";
import { useError } from "../Error";
import { OptionSlider } from "../OptionSlider";
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
          <OptionSlider
            value={component.spacing ?? SeparatorSpacingSize.Small}
            options={[
              {
                id: SeparatorSpacingSize.Small,
                label: t("small"),
              },
              {
                id: SeparatorSpacingSize.Large,
                label: t("large"),
              },
            ]}
            onSelect={(value) => {
              component.spacing = value;
              setData({ ...data });
            }}
          />
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

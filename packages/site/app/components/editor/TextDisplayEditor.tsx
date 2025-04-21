import type { APITextDisplayComponent } from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import { getQdMessageId } from "~/routes/_index";
import type { QueryData } from "~/types/QueryData";
import type { CacheManager } from "~/util/cache/CacheManager";
import { MAX_TOTAL_COMPONENTS_CHARACTERS } from "~/util/constants";
import { useError } from "../Error";
import { TextArea } from "../TextArea";
import { TopLevelComponentEditorContainer } from "./TopLevelComponentEditor";

export const TextDisplayEditor: React.FC<{
  message: QueryData["messages"][number];
  component: APITextDisplayComponent;
  index: number;
  data: QueryData;
  setData: React.Dispatch<QueryData>;
  cache?: CacheManager;
  open?: boolean;
}> = ({ message, component, index: i, data, setData, cache, open }) => {
  const { t } = useTranslation();
  const mid = getQdMessageId(message);
  const [error, setError] = useError(t);

  return (
    <TopLevelComponentEditorContainer
      t={t}
      message={message}
      component={component}
      index={i}
      data={data}
      setData={setData}
      open={open}
    >
      {error}
      <TextArea
        label={t("content")}
        className="w-full"
        maxLength={MAX_TOTAL_COMPONENTS_CHARACTERS}
        required
        value={component.content}
        markdown="full"
        cache={cache}
        onChange={({ currentTarget }) => {
          component.content = currentTarget.value;
          setData({ ...data });
        }}
      />
    </TopLevelComponentEditorContainer>
  );
};

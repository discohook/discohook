import {
  type APIMediaGalleryComponent,
  ButtonStyle,
} from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import { DraftFile, getQdMessageId } from "~/routes/_index";
import type { QueryData } from "~/types/QueryData";
import type { CacheManager } from "~/util/cache/CacheManager";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { useError } from "../Error";
import { FileOrUrlInput } from "../FileOrUrlInput";
import { TextInput } from "../TextInput";
import { CoolIcon } from "../icons/CoolIcon";
import { TopLevelComponentEditorContainer } from "./TopLevelComponentEditor";

export const MediaGalleryEditor: React.FC<{
  message: QueryData["messages"][number];
  component: APIMediaGalleryComponent;
  index: number;
  data: QueryData;
  setData: React.Dispatch<QueryData>;
  files: DraftFile[];
  setFiles: React.Dispatch<React.SetStateAction<DraftFile[]>>;
  cache?: CacheManager;
  open?: boolean;
}> = ({
  message,
  component: gallery,
  index: i,
  data,
  setData,
  files,
  setFiles,
  cache,
  open,
}) => {
  const { t } = useTranslation();
  const mid = getQdMessageId(message);
  const [error, setError] = useError(t);

  return (
    <TopLevelComponentEditorContainer
      t={t}
      message={message}
      component={gallery}
      index={i}
      data={data}
      setData={setData}
      open={open}
    >
      {error}
      <div className="space-y-2">
        {gallery.items.map((item, itemI) => {
          return (
            <>
              <div
                key={`message-${mid}-gallery-${i}-item-${itemI}`}
                className="space-y-1"
              >
                <div className="flex">controls</div>
                <div className="w-full">
                  <FileOrUrlInput
                    t={t}
                    files={files}
                    setFiles={setFiles}
                    // labelKey={t("url")}
                    // required
                    // className="w-full"
                    value={item.media.url}
                    onChange={(url) => {
                      item.media.url = url;
                      setData({ ...data });
                    }}
                  />
                </div>
                {item.media.url ? (
                  <>
                    <TextInput
                      label={t("description")}
                      className="w-full"
                      value={item.description ?? ""}
                      maxLength={256}
                      onChange={({ currentTarget }) => {
                        item.description = currentTarget.value || null;
                        setData({ ...data });
                      }}
                    />
                    <Checkbox
                      label={t("markSpoiler")}
                      checked={item.spoiler ?? false}
                      onChange={({ currentTarget }) => {
                        item.spoiler = currentTarget.checked;
                        setData({ ...data });
                      }}
                    />
                  </>
                ) : null}
              </div>
              {itemI < gallery.items.length - 1 ? (
                <hr className="border border-gray-500/20" />
              ) : null}
            </>
          );
        })}
        <Button
          onClick={() => {
            gallery.items.push({ media: { url: "" } });
            setData({ ...data });
          }}
          discordstyle={ButtonStyle.Primary}
          disabled={gallery.items.length >= 10}
        >
          <CoolIcon icon="Add_Plus" /> {t("addMedia")}
        </Button>
      </div>
    </TopLevelComponentEditorContainer>
  );
};

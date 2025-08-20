import {
  type APIContainerComponent,
  type APIMediaGalleryComponent,
  ButtonStyle,
} from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import { type DraftFile, getQdMessageId } from "~/routes/_index";
import type { QueryData } from "~/types/QueryData";
import type { CacheManager } from "~/util/cache/CacheManager";
import { MAX_GALLERY_ITEMS } from "~/util/constants";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { useError } from "../Error";
import { FileOrUrlInput } from "../FileOrUrlInput";
import { CoolIcon } from "../icons/CoolIcon";
import { TextInput } from "../TextInput";
import { EmbedEditorSection } from "./EmbedEditor";
import { TopLevelComponentEditorContainer } from "./TopLevelComponentEditor";

export const MediaGalleryEditor: React.FC<{
  message: QueryData["messages"][number];
  component: APIMediaGalleryComponent;
  parent: APIContainerComponent | undefined;
  index: number;
  data: QueryData;
  setData: React.Dispatch<QueryData>;
  files: DraftFile[];
  setFiles: React.Dispatch<React.SetStateAction<DraftFile[]>>;
  cache?: CacheManager;
  open?: boolean;
  cdn?: string;
}> = ({
  message,
  component: gallery,
  parent,
  index: i,
  data,
  setData,
  files,
  setFiles,
  open,
  cdn,
}) => {
  const { t } = useTranslation();
  const mid = getQdMessageId(message);
  const [error] = useError(t);

  return (
    <TopLevelComponentEditorContainer
      t={t}
      message={message}
      component={gallery}
      parent={parent}
      index={i}
      data={data}
      setData={setData}
      open={open}
    >
      {error}
      <div>
        {gallery.items.map((item, itemI) => (
          <div key={`message-${mid}-gallery-${i}-item-${itemI}`}>
            <EmbedEditorSection
              name={t("mediaItemN", { replace: { n: itemI + 1 } })}
              open={open}
              className="pl-0 -my-2 open:pb-4"
              actionsBar={{
                up: {
                  hidden: itemI === 0,
                  onClick: () => {
                    gallery.items.splice(itemI, 1);
                    gallery.items.splice(itemI - 1, 0, item);
                    setData({ ...data });
                  },
                },
                down: {
                  hidden:
                    itemI === gallery.items.length - 1 ||
                    gallery.items.length >= MAX_GALLERY_ITEMS,
                  onClick: () => {
                    gallery.items.splice(itemI, 1);
                    gallery.items.splice(itemI + 1, 0, item);
                    setData({ ...data });
                  },
                },
                copy: {
                  hidden: gallery.items.length >= MAX_GALLERY_ITEMS,
                  onClick: () => {
                    gallery.items.splice(itemI, 0, structuredClone(item));
                    setData({ ...data });
                  },
                },
                delete: {
                  onClick: () => {
                    gallery.items.splice(itemI, 1);
                    setData({ ...data });
                  },
                },
              }}
            >
              <div className="space-y-1 -mt-2">
                <div className="w-full">
                  <FileOrUrlInput
                    t={t}
                    files={files}
                    setFiles={setFiles}
                    value={item.media.url}
                    onChange={(url) => {
                      item.media.url = url;
                      setData({ ...data });
                    }}
                    allowedExtensions="*"
                    cdn={cdn}
                    gifPrompt
                  />
                </div>
                {item.media.url ? (
                  <>
                    <TextInput
                      label={t("description")}
                      className="w-full"
                      value={item.description ?? ""}
                      maxLength={1024}
                      onChange={({ currentTarget }) => {
                        item.description = currentTarget.value || null;
                        setData({ ...data });
                      }}
                    />
                    <Checkbox
                      label={t("markSpoiler")}
                      checked={item.spoiler ?? false}
                      onCheckedChange={(checked) => {
                        item.spoiler = checked;
                        setData({ ...data });
                      }}
                    />
                  </>
                ) : null}
              </div>
            </EmbedEditorSection>
            {itemI < gallery.items.length - 1 ? (
              <hr className="border border-gray-500/20" />
            ) : null}
          </div>
        ))}
        <Button
          // className="-mt-2"
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

import { APIMediaGalleryComponent } from "discord-api-types/v10";
import mime from "mime";
import { SetImageModalData } from "~/modals/ImageModal";
import { DraftFile } from "~/routes/_index";
import { transformFileName } from "~/util/files";
import { Gallery } from "./Gallery";

export const PreviewMediaGallery: React.FC<{
  component: APIMediaGalleryComponent;
  files?: DraftFile[];
  setImageModalData?: SetImageModalData;
  cdn?: string;
}> = ({ component: gallery, files, setImageModalData, cdn }) => {
  return (
    <div>
      <Gallery
        cdn={cdn}
        setImageModalData={setImageModalData}
        attachments={gallery.items.map((item, i) => {
          let url = item.media.url;
          let file: DraftFile | undefined;

          if (url.startsWith("attachment://") && files) {
            file = files.find(
              (f) => `attachment://${transformFileName(f.file.name)}` === url,
            );
            if (file?.url) {
              url = file.url;
            }
          }

          let contentType = file ? file.file.type : null;
          if (!contentType) {
            try {
              // mime can't deal with whole URLs the way we want it to, so we
              // strip the params then provide it like a sort of file path
              const { pathname } = new URL(url);
              contentType = mime.getType(pathname);
            } catch {}
          }
          return {
            id: String(i),
            url,
            // Try displaying as image if we can't determine the type
            content_type: contentType ?? "image/png",
            filename: file?.file.name ?? "unknown",
            size: file?.file.size ?? 0,
            proxy_url: "#",
          };
        })}
      />
    </div>
  );
};

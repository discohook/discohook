import type { APIMediaGalleryComponent } from "discord-api-types/v10";
import mime from "mime";
import type { SetImageModalData } from "~/modals/ImageModal";
import type { DraftFile } from "~/routes/_index";
import { getImageUri } from "./Embed";
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
            const fileUrl = getImageUri(url, files);
            if (fileUrl) url = fileUrl;
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

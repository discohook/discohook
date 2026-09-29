import { APIMediaGalleryComponent, ComponentType } from "discord-api-types/v10";
import type React from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type z from "zod/v3";
import {
  ComponentEditForm,
  type EditingComponentData,
} from "~/modals/ComponentEditModal";
import { Modal, type ModalProps } from "~/modals/Modal";
import type { TFunction } from "~/types/i18next";
import {
  linkEmbedComponentTypes,
  type LinkQueryData,
  type QueryData,
  type ZodLinkEmbedContainerComponent,
} from "~/types/QueryData";
import { randomString } from "~/util/text";
import { useError } from "../Error";
import { InfoBox } from "../InfoBox";
import { ContainerEditor } from "./ContainerEditor";

const DEFAULT_CONTAINER: z.infer<typeof ZodLinkEmbedContainerComponent> = {
  type: ComponentType.Container,
  components: [],
};

const MAX_LINK_EMBED_CONTAINER_BYTES = 3000;
const MAX_LINK_EMBED_CONTAINER_MEDIA_GALLERY_ITEMS = 10;

// fork of ComponentEditModal with less complicated needs
export const LinkButtonEditModal = ({
  t,
  component,
  setComponent,
  ...props
}: ModalProps & Partial<EditingComponentData> & { t: TFunction }) => {
  const [error, setError] = useError();
  return (
    <Modal title={t("editComponent")} {...props} size="lg">
      {error}
      {component && setComponent && (
        <div>
          <ComponentEditForm
            t={t}
            component={component}
            setComponent={setComponent}
            submit={undefined}
            cache={undefined}
            setEditingFlow={() => {}}
            setError={setError}
          />
        </div>
      )}
    </Modal>
  );
};

export const LinkEmbedContainerEditor: React.FC<{
  data: LinkQueryData;
  setData: React.Dispatch<React.SetStateAction<LinkQueryData>>;
  open?: boolean;
  setEditingComponent: React.Dispatch<
    React.SetStateAction<EditingComponentData | undefined>
  >;
}> = ({ data, setData, open: defaultOpen, setEditingComponent }) => {
  const { t } = useTranslation();
  const sourceContainer = data.embed.data.components?.[0];
  const qdContainer = { ...(sourceContainer ?? DEFAULT_CONTAINER) };

  const messageId = useMemo(() => randomString(10), []);
  // emulate real querydata to satisfy ContainerEditor's expected behavior
  // this seems silly but it makes things much easier
  const [queryData, setQueryData] = useState<QueryData>({
    backup_id: data.backup_id,
    messages: [
      {
        _id: messageId,
        data: { components: [qdContainer] },
      },
    ],
  });
  const { errors } = useMemo(() => {
    const counts = { bytes: JSON.stringify(data).length, mediaGalleryItems: 0 };
    const container = data.embed.data.components?.[0];
    if (container) {
      for (const component of container.components) {
        if (component.type === ComponentType.MediaGallery) {
          counts.mediaGalleryItems +=
            (component as unknown as APIMediaGalleryComponent).items?.length ??
            0;
        }
      }
    }

    const errors: string[] = [];
    if (counts.bytes > MAX_LINK_EMBED_CONTAINER_BYTES) {
      errors.push(t("linkContainerTooLarge"));
    }
    if (
      counts.mediaGalleryItems > MAX_LINK_EMBED_CONTAINER_MEDIA_GALLERY_ITEMS
    ) {
      errors.push(
        t("linkContainerTooManyGalleryItems", {
          replace: {
            maximum: MAX_LINK_EMBED_CONTAINER_MEDIA_GALLERY_ITEMS,
            count:
              counts.mediaGalleryItems -
              MAX_LINK_EMBED_CONTAINER_MEDIA_GALLERY_ITEMS,
          },
        }),
      );
    }

    return { counts, errors };
  }, [t, data]);

  return (
    <div>
      {errors.length > 0 && (
        <InfoBox severity="red" icon="Circle_Warning" className="mb-1">
          {errors.join("\n")}
        </InfoBox>
      )}
      <ContainerEditor
        open={defaultOpen}
        message={queryData.messages[0]}
        component={
          // for identity stablity on first render, prefer a derivation of querydata.
          // if we don't do this, the object present in message.data is not the same
          // as the one we pass to `component`, causing the first edit to be ignored
          // and the counter to show "0" initially.
          (queryData.messages?.[0].data.components?.[0] ??
            // this should always be present, but fallback to qdContainer for type safety
            qdContainer) as typeof qdContainer
        }
        data={queryData}
        index={0}
        setData={(newData) => {
          const newMessage = newData.messages[0];
          const newContainer = newMessage?.data.components?.[0];
          if (newContainer?.type === ComponentType.Container) {
            setQueryData({
              ...queryData,
              messages: [
                { _id: messageId, data: { components: [newContainer] } },
              ],
            });
            data.embed.data.components = [
              newContainer as typeof DEFAULT_CONTAINER,
            ];
            setData({ ...data });
          }
        }}
        setEditingComponent={setEditingComponent}
        componentFoundBackupsHook={[{}, () => {}]}
        parent={undefined}
        cache={undefined}
        files={[]}
        // link preview editor options
        interactiveComponents={false}
        actionsBar={{ up: null, down: null, copy: null, delete: null }}
        allowedChildrenTypes={linkEmbedComponentTypes}
      />
    </div>
  );
};

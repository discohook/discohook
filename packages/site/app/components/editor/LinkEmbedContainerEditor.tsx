import { ComponentType } from "discord-api-types/v10";
import type React from "react";
import { useState } from "react";
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
import { ContainerEditor } from "./ContainerEditor";

const DEFAULT_CONTAINER: z.infer<typeof ZodLinkEmbedContainerComponent> = {
  type: ComponentType.Container,
  components: [],
};

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
  const sourceContainer = data.embed.data.components?.[0];
  // emulate real querydata to satisfy ContainerEditor's expected behavior
  // this seems silly but it makes things much easier
  const [queryData, setQueryData] = useState<QueryData>({
    backup_id: data.backup_id,
    messages: [
      {
        _id: randomString(10),
        data: { components: [sourceContainer ?? DEFAULT_CONTAINER] },
      },
    ],
  });

  return (
    <ContainerEditor
      open={defaultOpen}
      message={queryData.messages[0]}
      component={sourceContainer ?? DEFAULT_CONTAINER}
      data={queryData}
      index={0}
      setData={(newData) => {
        const newMessage = newData.messages[0];
        const newContainer = newMessage?.data.components?.[0];
        if (newContainer?.type === ComponentType.Container) {
          setQueryData({
            ...queryData,
            messages: [{ ...newMessage, data: { components: [newContainer] } }],
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
  );
};

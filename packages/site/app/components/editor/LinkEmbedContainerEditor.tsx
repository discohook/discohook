import { ComponentType } from "discord-api-types/v10";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type z from "zod/v3";
import {
  ComponentEditForm,
  type EditingComponentData,
} from "~/modals/ComponentEditModal";
import { Modal, type ModalProps } from "~/modals/Modal";
import type { TFunction } from "~/types/i18next";
import type {
  LinkQueryData,
  ZodLinkEmbedContainerComponent,
} from "~/types/QueryData";
import { useError } from "../Error";
import { ContainerEditor } from "./ContainerEditor";

const DEFAULT_CONTAINER: z.infer<typeof ZodLinkEmbedContainerComponent> = {
  type: ComponentType.Container,
  components: [],
};

// fork of ComponentEditModal with less complicated needs
const LinkButtonEditModal = ({
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
}> = ({ data, setData, open: defaultOpen }) => {
  const { t } = useTranslation();
  const [editingComponent, setEditingComponent] =
    useState<EditingComponentData>();
  const container = data.embed.data.components?.[0] ?? DEFAULT_CONTAINER;
  const message = { data: { components: [container] } };

  return (
    <div>
      <LinkButtonEditModal
        t={t}
        open={!!editingComponent}
        setOpen={() => setEditingComponent(undefined)}
        {...editingComponent}
      />
      <ContainerEditor
        open={defaultOpen}
        message={message}
        component={container}
        data={{ messages: [message] }}
        index={0}
        setData={(newData) => {
          const newContainer = newData.messages[0]?.data?.components?.[0];
          if (newContainer?.type === ComponentType.Container) {
            data.embed.data.components = [
              newContainer as typeof DEFAULT_CONTAINER,
            ];
            setData({ ...data });
          }
        }}
        interactiveComponents={false}
        setEditingComponent={setEditingComponent}
        componentFoundBackupsHook={[{}, () => {}]}
        parent={undefined}
        cache={undefined}
        files={[]}
      />
    </div>
  );
};

import { Form, useFetcher } from "@remix-run/react";
import { Trans, useTranslation } from "react-i18next";
import { BRoutes, apiUrl } from "~/api/routing";
import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/CoolIcon";
import { TextInput } from "~/components/TextInput";
import { LoadedBackup } from "~/routes/me";
import { action as ApiBackupsIdAction } from "../api/v1/backups.$id";
import { Modal, ModalProps } from "./Modal";

export const BackupEditModal = (
  props: ModalProps & { backup?: LoadedBackup },
) => {
  const { t } = useTranslation();
  const { backup } = props;
  const fetcher = useFetcher<typeof ApiBackupsIdAction>();

  return (
    <Modal title={t("editBackupTitle")} {...props}>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          fetcher.submit(new FormData(e.currentTarget), {
            action: apiUrl(BRoutes.backups(backup?.id)),
            method: "PATCH",
          });
        }}
      >
        {backup && (
          <div className="space-y-2">
            <p>
              <Trans
                t={t}
                i18nKey="editBackupMessages"
                components={[
                  <CoolIcon icon="External_Link" className="align-sub" />,
                ]}
              />
            </p>
            <TextInput
              name="name"
              label={t("name")}
              defaultValue={backup.name}
              className="w-full"
              maxLength={100}
              required
            />
          </div>
        )}
        <div className="flex w-full mt-4">
          <Button className="mx-auto" disabled={fetcher.state !== "idle"}>
            {t("save")}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

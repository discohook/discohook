import { Form, useFetcher } from "@remix-run/react";
import { Button } from "~/components/Button";
import { TextInput } from "~/components/TextInput";
import { LoadedBackup } from "~/routes/me";
import { action as ApiBackupsIdAction } from "../routes/api.backups.$id";
import { Modal, ModalProps } from "./Modal";

const strings = {
  title: "Edit Backup Details",
  editMessage: "To edit the messages in a backup, click the {0} button.",
  name: "Name",
  save: "Save",
};
//   fr: {
//     title: "Modifier les détails de la sauvegarde",
//     editMessage: "Pour modifier les messages d'une sauvegarde, cliquez sur le bouton {0}.",
//     name: "Nom",
//     save: "Enregistrer",
//   },
// });

export const BackupEditModal = (
  props: ModalProps & { backup?: LoadedBackup }
) => {
  const { backup } = props;
  const fetcher = useFetcher<typeof ApiBackupsIdAction>();

  return (
    <Modal title={strings.title} {...props}>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          fetcher.submit(new FormData(e.currentTarget), {
            action: `/api/backups/${backup?.id}`,
            method: "PATCH",
          });
        }}
      >
        {backup && (
          <div className="space-y-2">
            <p>
              {strings.editMessage}
              {/*strings.formatString(
                strings.editMessage,
                <CoolIcon icon="External_Link" className="align-sub" />
              )*/}
            </p>
            <TextInput
              name="name"
              label={strings.name}
              defaultValue={backup.name}
              className="w-full"
              maxLength={100}
              required
            />
          </div>
        )}
        <div className="flex w-full mt-4">
          <Button className="mx-auto" disabled={fetcher.state !== "idle"}>
            {strings.save}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

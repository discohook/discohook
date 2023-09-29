import { useFetcher } from "@remix-run/react";
import LocalizedStrings from "react-localization";
import { User } from "~/session.server";
import { action as shareCreateAction } from "../routes/api.share";
import { Modal, ModalProps } from "./Modal";

const strings = new LocalizedStrings({
  en: {
    title: "Settings",
  },
});

export const SettingsModal = (props: ModalProps & { user?: User | null }) => {
  const { user } = props;

  const fetcher = useFetcher<typeof shareCreateAction>();
  return (
    <Modal title={strings.title} {...props}>
    </Modal>
  );
};

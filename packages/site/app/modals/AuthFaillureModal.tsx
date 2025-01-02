import { useTranslation } from "react-i18next";
import { Button } from "~/components/Button";
import { codeBlockStyle } from "~/components/preview/Markdown";
import { Modal, ModalProps } from "./Modal";

export const AuthFailureModal = (props: ModalProps & { message?: string }) => {
  const { t } = useTranslation();
  return (
    <Modal title="Failure" {...props}>
      <p>
        You have not been logged in. A few things might have happened, but here
        are some of the possibilities:
      </p>
      <ul className="list-disc list-inside">
        <li>You simply cancelled (no action required)</li>
        <li>
          Discohook failed to authorize you with Discord (try again later)
        </li>
        <li>
          One of the requested scopes was missing (do not modify the
          authorization URL)
        </li>
      </ul>
      {props.message && props.message !== "[object Object]" ? (
        // Above might seem like treating the symptoms but I don't think I can
        // trust remix-auth-discord to not spit that out
        <div className="mt-2">
          <p>A relevant error is shown below:</p>
          <pre className={codeBlockStyle}>{props.message}</pre>
        </div>
      ) : null}
      <div className="flex w-full mt-4">
        <Button onClick={() => props.setOpen(false)} className="mx-auto">
          {t("ok")}
        </Button>
      </div>
    </Modal>
  );
};

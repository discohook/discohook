import { ButtonStyle } from "discord-api-types/v10";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { ZodError } from "zod/v3";
import { Button } from "~/components/Button";
import { ButtonSelect } from "~/components/ButtonSelect";
import type { QueryData } from "~/types/QueryData";
import { base64Decode, copyText } from "~/util/text";
import { Modal, PlainModalHeader, type ModalProps } from "./Modal";

export interface InvalidDataModalProps {
  raw: string;
  zodError: ZodError<QueryData>;
}

export const InvalidDataModal = ({
  raw,
  setData,
  setTab,
  zodError: _,
  ...props
}: ModalProps &
  Partial<InvalidDataModalProps> & {
    setData: React.Dispatch<QueryData>;
    setTab: React.Dispatch<React.SetStateAction<"editor" | "preview">>;
  }) => {
  const { t } = useTranslation();
  const variations = useMemo(() => {
    let b64Parsed: string | undefined;
    let jsonParsed: unknown | undefined;
    if (raw) {
      try {
        b64Parsed = base64Decode(raw);
        if (b64Parsed) jsonParsed = JSON.parse(b64Parsed);
      } catch {}
    }
    return { raw, b64Parsed, jsonParsed };
  }, [raw]);

  return (
    <Modal {...props}>
      <PlainModalHeader onClose={() => props.setOpen(false)}>
        {t("invalidData.title")}
      </PlainModalHeader>
      <p>{t("invalidData.message")}</p>
      <p className="mt-1.5">
        {t(
          variations.jsonParsed
            ? "invalidData.loadable"
            : "invalidData.unloadable",
        )}
      </p>
      <div className="flex w-full mt-4 justify-center gap-2">
        <Button
          discordstyle={ButtonStyle.Danger}
          disabled={!variations.jsonParsed}
          loading={!setData}
          onClick={() => {
            setData?.(variations.jsonParsed as QueryData);
            props.setOpen(false);
            setTab("editor");
          }}
        >
          {t("invalidData.loadAnyway")}
        </Button>
        <ButtonSelect<keyof typeof variations>
          discordstyle={ButtonStyle.Secondary}
          options={[
            {
              value: "raw",
              label: t("invalidData.raw"),
              disabled: !variations.raw,
            },
            {
              value: "b64Parsed",
              label: t("invalidData.b64"),
              disabled: !variations.b64Parsed,
            },
            {
              value: "jsonParsed",
              label: t("invalidData.json"),
              disabled: !variations.jsonParsed,
            },
          ]}
          onValueChange={(value) => {
            if (value === "jsonParsed") {
              copyText(JSON.stringify(variations[value], undefined, 2));
            } else {
              copyText(variations[value] ?? "");
            }
          }}
        >
          {t("copy")}
        </ButtonSelect>
      </div>
    </Modal>
  );
};

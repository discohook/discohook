import { useState } from "react";
import type { TFunction } from "~/types/i18next";
import { InfoBox } from "./InfoBox";
import { codeBlockStyle } from "./preview/Markdown";

type ErrorParams =
  | { code: string; message?: string; raw?: string }
  | { code?: string; message: string; raw?: string };

export const useError = (t?: TFunction) => {
  const [text, setText] = useState<string>();
  const [raw, setRaw] = useState<string>();

  return [
    text ? (
      <InfoBox
        key="0"
        severity="red"
        icon="Triangle_Warning"
        collapsible={!!raw}
      >
        {text}
        {!!raw && <pre className={codeBlockStyle}>{raw}</pre>}
      </InfoBox>
    ) : null,
    (params: ErrorParams | undefined) => {
      if (!params) {
        setText(undefined);
        return;
      }
      if (params.code && t) {
        setText(t(params.code));
      } else {
        setText(params.message);
      }
      if (params.raw) setRaw(params.raw);
    },
  ] as const;
};

export type SetErrorFunction = ReturnType<typeof useError>[1];

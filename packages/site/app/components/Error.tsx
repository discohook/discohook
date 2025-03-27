import type { TFunction } from "i18next";
import { useState } from "react";
import { codeBlockStyle } from "~/util/markdown/styles";
import { InfoBox } from "./InfoBox";

type ErrorParams =
  | { code: string; message?: string; raw?: string }
  | { code?: string; message: string; raw?: string };

export const useError = (t?: TFunction) => {
  const [text, setText] = useState<string>();
  const [raw, setRaw] = useState<string>();

  return [
    text && (
      <InfoBox severity="red" icon="Triangle_Warning" collapsible={!!raw}>
        {text}
        {!!raw && <pre className={codeBlockStyle}>{raw}</pre>}
      </InfoBox>
    ),
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

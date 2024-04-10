import { TFunction } from "i18next";
import { useState } from "react";
import { InfoBox } from "./InfoBox";

type ErrorParams =
  | { code: string; message?: string }
  | { code?: string; message: string };

export const useError = (t?: TFunction) => {
  const [text, setText] = useState<string>();

  return [
    <>
      {text && (
        <InfoBox severity="red" icon="Triangle_Warning">
          {text}
        </InfoBox>
      )}
    </>,
    (params: ErrorParams | undefined) => {
      if (!params) {
        setText(undefined);
        return;
      }
      if (params.code && t) {
        setText(t(`errors.${params.code}`));
      } else {
        setText(params.message);
      }
    },
  ] as const;
};

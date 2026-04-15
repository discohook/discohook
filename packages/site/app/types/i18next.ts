import type { useTranslation } from "react-i18next";

export type TFunction = ReturnType<typeof useTranslation>["t"];
export type i18n = ReturnType<typeof useTranslation>["i18n"];

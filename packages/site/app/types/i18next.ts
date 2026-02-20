import type { useTranslation } from "react-i18next";

export type TFunction = ReturnType<typeof useTranslation>["t"];

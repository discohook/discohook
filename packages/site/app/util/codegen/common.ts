import type { QueryData } from "~/types/QueryData";

export type CodeGeneratorData = Pick<
  QueryData["messages"][number]["data"],
  "embeds" | "components" // | "poll"
>;

export interface CodeGeneratorPreferences {
  quoteStyle?: "double" | "single";
  colorSpelling?: "color" | "colour";
}

export const quoteString = (
  text: string,
  preferences: Pick<CodeGeneratorPreferences, "quoteStyle">,
) => {
  const q = preferences.quoteStyle === "single" ? "'" : '"';
  return q + text.replaceAll(q, `\\${q}`).replaceAll("\n", "\\n") + q;
};

export const indentList = (arr: string[], spaces: number) =>
  arr.map((line) => `${" ".repeat(spaces)}${line}`);

export type CodeGeneratorFn = (
  data: CodeGeneratorData,
  preferences: CodeGeneratorPreferences,
) => { imports?: string[]; code: string[]; documentation: string };

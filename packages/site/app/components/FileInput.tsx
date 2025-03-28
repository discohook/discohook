import type { TFunction } from "i18next";
import type { ReactNode } from "react";
import { CoolIcon } from "./icons/CoolIcon";

export const FileInput = (
  props: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > & {
    label: ReactNode;
    description?: ReactNode;
    errors?: ReactNode[];
    clearable?: boolean;
    t?: TFunction;
  },
) => {
  const { t } = props;
  const placeholder = t ? t("selectFile") : "Select a file";

  return (
    <label className="block group/input">
      <p className="text-sm font-medium flex">{props.label}</p>
      {props.description && <p className="text-sm">{props.description}</p>}
      <div className={`flex ${props.className ?? ""}`}>
        <input
          {...props}
          type="file"
          className="peer/input"
          hidden
          onInput={(e) => {
            const files = e.currentTarget.files;
            const fileNames: string[] = [];
            if (files) {
              for (const file of files) {
                fileNames.push(file.name);
              }
            }
            const textBox =
              e.currentTarget.parentElement?.querySelector<HTMLParagraphElement>(
                "p.filenames",
              );
            if (textBox) {
              if (fileNames.length === 0) {
                textBox.innerText = placeholder;
              } else {
                textBox.innerText = fileNames.join(", ");
              }
            }
            if (props.onInput) {
              props.onInput(e);
            }
          }}
        />
        <div className="h-9 w-9 rounded-l-lg border border-r-0 bg-white border-border-normal dark:bg-[#333338] dark:border-border-normal-dark peer-invalid/input:border-rose-400 flex shrink-0 transition cursor-pointer">
          <CoolIcon icon="File_Upload" className="text-xl m-auto" />
        </div>
        <div className="h-9 rounded-r-lg border bg-white border-border-normal dark:bg-[#333338] dark:border-border-normal-dark peer-invalid/input:border-rose-400 grow flex px-[14px] transition cursor-pointer">
          <p className="my-auto filenames">{placeholder}</p>
        </div>
        {props.clearable && (
          <button
            type="button"
            className="h-9 w-9 rounded-lg border  ml-2 bg-white border-border-normal dark:bg-[#333338] dark:border-border-normal-dark text-rose-400 flex shrink-0 transition"
            onClick={(e) => {
              // biome-ignore lint/style/noNonNullAssertion: We know there is a parent
              const p = e.currentTarget.parentElement!;
              const input = p.querySelector<HTMLInputElement>(
                // input.peer/input is invalid
                `input[class="peer/input"]`,
              );
              const textBox =
                p.querySelector<HTMLParagraphElement>("p.filenames");
              if (input) {
                input.value = "";
              }
              if (textBox) {
                textBox.innerText = placeholder;
              }
            }}
          >
            <CoolIcon icon="Trash_Full" className="text-2xl m-auto" />
          </button>
        )}
      </div>
      {props.errors
        ?.filter((e) => e !== undefined)
        .map((error, i) => (
          <p
            key={`${props.id ?? props.label}-error-${i}`}
            className="text-rose-500 dark:text-rose-300 font-medium mt-1 text-sm"
          >
            <CoolIcon icon="Circle_Warning" className="mr-1.5" />
            {error}
          </p>
        ))}
    </label>
  );
};

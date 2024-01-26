import { ReactNode } from "react";
import { CoolIcon } from "./CoolIcon";

export const FileInput = (
  props: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > & {
    label: ReactNode;
    description?: ReactNode;
    errors?: ReactNode[];
    clearable?: boolean;
  },
) => (
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
          let fileNames: string[] = [];
          if (files) {
            for (const file of files) {
              fileNames.push(file.name);
            }
          }
          const textBox =
            e.currentTarget.parentElement!.querySelector<HTMLParagraphElement>(
              "p.filenames",
            );
          if (textBox) {
            if (fileNames.length === 0) {
              textBox.innerText = "Select a file";
            } else {
              textBox.innerText = fileNames.join(", ");
            }
          }
          if (props.onInput) {
            props.onInput(e);
          }
        }}
      />
      <div className="h-9 w-9 rounded mr-2 bg-gray-300 border-gray-200 dark:border-transparent dark:bg-[#292b2f] dark:group-hover/input:border-black/5 peer-invalid/input:border-rose-400 flex shrink-0 transition cursor-pointer">
        <CoolIcon icon="File_Upload" className="text-2xl m-auto" />
      </div>
      <div className="h-9 rounded border bg-gray-300 border-gray-200 dark:border-transparent dark:bg-[#292b2f] dark:group-hover/input:border-black/5 peer-invalid/input:border-rose-400 grow flex px-[14px] transition cursor-pointer">
        <p className="my-auto filenames">Select a file</p>
      </div>
      {props.clearable && (
        <button
          className="h-9 w-9 rounded ml-2 bg-gray-300 border-gray-200 dark:border-transparent dark:bg-[#292b2f] dark:group-hover/input:border-black/5 text-rose-400 flex shrink-0 transition"
          onClick={(e) => {
            const p = e.currentTarget.parentElement!,
              input = p.querySelector<HTMLInputElement>(
                // input.peer/input is invalid
                `input[class="peer/input"]`,
              ),
              textBox = p.querySelector<HTMLParagraphElement>("p.filenames");
            if (input) {
              input.value = "";
            }
            if (textBox) {
              textBox.innerText = "Select a file";
            }
          }}
        >
          <CoolIcon icon="Trash_Full" className="text-2xl m-auto" />
        </button>
      )}
    </div>
    {props.errors &&
      props.errors
        .filter((e) => e !== undefined)
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
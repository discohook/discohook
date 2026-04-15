import { ButtonStyle } from "discord-api-types/v10";
import { useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { twMerge } from "tailwind-merge";
import { Button } from "~/components/Button";
import { Checkbox } from "~/components/Checkbox";
import { codeBlockStyle, linkClassName } from "~/components/preview/Markdown";
import { StringSelect } from "~/components/StringSelect";
import { cycleCopyText } from "~/util/text";
import { Modal, ModalFooter, type ModalProps, PlainModalHeader } from "./Modal";

import type { CodeGeneratorData, CodeGeneratorFn } from "~/util/codegen/common";
import djs14 from "~/util/codegen/discordjs";
import dpy2 from "~/util/codegen/discordpy";

type DiscordLibrary = "djs14" | "dpy2";

// I don't know if there's a proper way to "do code gen" but this seemed
// reasonably sensible to me since there's a pretty limited amount of
// output
const codegen: Record<DiscordLibrary, CodeGeneratorFn> = { djs14, dpy2 };

const libraryOptions: { label: string; value: DiscordLibrary }[] = [
  {
    label: "discord.js v14",
    value: "djs14",
  },
  {
    label: "discord.py v2",
    value: "dpy2",
  },
];

export type CodeGeneratorProps = { data: Partial<CodeGeneratorData> };

export const CodeGeneratorModal = (props: ModalProps & CodeGeneratorProps) => {
  const { t } = useTranslation();

  const [wordWrap, setWordWrap] = useState(false);
  const [library, setLibrary] = useState<DiscordLibrary>("dpy2");

  const generated = useMemo(() => {
    const { imports, code, ...rest } = codegen[library](props.data, {});
    return {
      imports:
        imports && imports.length === 0 ? undefined : imports?.join("\n"),
      code: code.join("\n"),
      ...rest,
    };
  }, [library, props.data]);

  return (
    <Modal {...props}>
      <PlainModalHeader>{t("codeGenerator")}</PlainModalHeader>
      <StringSelect
        label={t("library")}
        options={libraryOptions}
        value={libraryOptions.find((o) => o.value === library)}
        onChange={(o) => {
          const opt = o as (typeof libraryOptions)[number];
          setLibrary(opt.value);
        }}
      />
      <p className="cursor-default text-sm mt-2">{t("imports")}</p>
      {generated.imports ? (
        <pre className="w-full bg-clip-border text-sm">
          <code className={codeBlockStyle}>{generated.imports}</code>
        </pre>
      ) : (
        t("noImports")
      )}
      <p className="cursor-default text-sm mt-2">{t("code")}</p>
      <pre className="w-full bg-clip-border text-sm">
        <code
          className={twMerge(
            codeBlockStyle,
            wordWrap ? "whitespace-pre-wrap" : "whitespace-pre",
          )}
        >
          {generated.code}
        </code>
      </pre>
      <p className="text-sm text-muted dark:text-muted-dark">
        <Trans
          t={t}
          i18nKey="codeNote"
          components={{
            docs: (
              // biome-ignore lint/a11y/useAnchorContent: Content supplied by i18next
              <a
                href={generated.documentation}
                className={linkClassName}
                target="_blank"
                rel="noreferrer"
              />
            ),
          }}
          values={{
            library:
              libraryOptions.find((o) => o.value === library)?.label ?? library,
          }}
        />
      </p>
      <div className="mt-4">
        <Checkbox
          label={t("wordWrap")}
          checked={wordWrap}
          onCheckedChange={(checked) => setWordWrap(checked)}
        />
      </div>
      <ModalFooter className="flex gap-2 flex-wrap">
        <Button
          discordstyle={ButtonStyle.Secondary}
          onClick={(e) =>
            cycleCopyText(generated.imports ?? "", t, e.currentTarget)
          }
          disabled={!generated.imports}
        >
          {t("copyImports")}
        </Button>
        <Button
          discordstyle={ButtonStyle.Secondary}
          onClick={(e) => cycleCopyText(generated.code, t, e.currentTarget)}
        >
          {t("copyCode")}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

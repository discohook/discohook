import {
  type APIEmbed,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/Button";
import { TextInput } from "~/components/TextInput";
import { PreviewButton } from "~/components/preview/Components";
import { Embed } from "~/components/preview/Embed";
import type { GuideFileMeta } from "~/routes/guide.$";
import tags_ from "../../public/help/en.json";
import { ExampleModal } from "./ExampleModal";
import { Modal, ModalFooter, type ModalProps, PlainModalHeader } from "./Modal";

export const HelpModal = (props: ModalProps) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const tags: Record<string, string | APIEmbed> = tags_;

  const [exampleOpen, setExampleOpen] = useState(false);

  const [indexData, setIndexData] = useState<Record<string, GuideFileMeta[]>>();
  useEffect(() => {
    if (!indexData && props.open) {
      fetch("/guide-index.json", { method: "GET" }).then((response) => {
        if (response.ok)
          response
            .json()
            .then((data) => setIndexData(data as typeof indexData));
      });
    }
  }, [indexData, props.open]);

  return (
    <Modal {...props}>
      <PlainModalHeader>{t("help")}</PlainModalHeader>
      <ExampleModal open={exampleOpen} setOpen={setExampleOpen} />
      <TextInput
        label={t("search")}
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        className="w-full mb-2"
        placeholder={t("helpSearchPlaceholder")}
      />
      <div className="overflow-y-auto max-h-[32rem] flex flex-col">
        <div className="mx-auto space-y-4">
          {Object.entries(tags)
            .filter(
              ([key, value]) =>
                key === query ||
                (typeof value !== "string" &&
                  value.title?.toLowerCase()?.includes(query.toLowerCase())),
            )
            .map(([key, value]) => {
              if (typeof value === "string" && key !== query) return <></>;
              const data =
                typeof value === "string" ? (tags[value] as APIEmbed) : value;
              data.color = data.color ?? 0x58b9ff;

              return <Embed key={`help-tag-${key}`} embed={data} />;
            })}
          {indexData &&
            Object.entries(indexData)
              .flatMap((entries) =>
                entries[1].map((e) => {
                  e.path = entries[0];
                  return e;
                }),
              )
              .filter(
                (entry) =>
                  entry.file === query ||
                  entry.title.toLowerCase().includes(query.toLowerCase()),
              )
              .map((entry) => {
                const data: APIEmbed = {
                  provider: { name: "Discohook Guides", url: "/guide" },
                  title: entry.title,
                  description: entry.description,
                  thumbnail: entry.thumbnail
                    ? { url: entry.thumbnail }
                    : undefined,
                  url: `/guide/${entry.path ? `${entry.path}/` : ""}${
                    entry.file
                  }`,
                  color: entry.color || 0x58b9ff,
                };

                return (
                  <Embed
                    key={`help-guide-${entry.path}/${entry.file}`}
                    embed={data}
                  />
                );
              })}
        </div>
      </div>
      <ModalFooter className="flex gap-2 flex-wrap">
        <Button
          className="ltr:ml-auto rtl:mr-auto"
          onClick={() => props.setOpen(false)}
        >
          {t("ok")}
        </Button>
        <Button
          discordstyle={ButtonStyle.Secondary}
          onClick={() => setExampleOpen(true)}
        >
          {t("embedExample")}
        </Button>
        <PreviewButton
          data={{
            type: ComponentType.Button,
            style: ButtonStyle.Link,
            url: "/discord",
            label: t("supportServer"),
          }}
        />
      </ModalFooter>
    </Modal>
  );
};

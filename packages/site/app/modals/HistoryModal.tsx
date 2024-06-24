import { ButtonStyle } from "discord-api-types/v10";
import React, { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Button } from "~/components/Button";
import { CoolIcon } from "~/components/icons/CoolIcon";
import { Embed } from "~/components/preview/Embed";
import { Message } from "~/components/preview/Message";
import { HistoryItem } from "~/routes/_index";
import { LinkHistoryItem, linkEmbedToAPIEmbed } from "~/routes/link";
import { LinkQueryData, QueryData } from "~/types/QueryData";
import { useLocalStorage } from "~/util/localstorage";
import { Modal, ModalProps } from "./Modal";

enum ResetState {
  Default = 0,
  Confirm = 1,
  Finish = 2,
}

export const HistoryModal = <
  T extends HistoryItem | LinkHistoryItem,
  Q extends QueryData | LinkQueryData,
>(
  props: ModalProps & {
    localHistory: T[];
    setLocalHistory: React.Dispatch<React.SetStateAction<T[]>>;
    setData: React.Dispatch<Q>;
    resetData: () => void;
  },
) => {
  const { t } = useTranslation();
  const { localHistory, setLocalHistory, setData, resetData } = props;
  const [settings] = useLocalStorage();
  const [resetState, setResetState] = useState(ResetState.Default);
  useEffect(() => {
    if (resetState === ResetState.Confirm) {
      setTimeout(() => {
        if (resetState === ResetState.Confirm) {
          setResetState(ResetState.Default);
        }
      }, 5000);
    }
  }, [resetState]);

  return (
    <Modal title={t("history")} {...props}>
      <div className="flex mb-4">
        <p className="ltr:mr-2 rtl:ml-2">
          <Trans
            t={t}
            i18nKey="historyNote"
            components={{
              bold: <span className="font-bold" />,
            }}
          />
        </p>
        <Button
          className="ml-auto shrink-0"
          onClick={() => {
            if (resetState === ResetState.Default) {
              setResetState(ResetState.Confirm);
              return;
            }
            resetData();
            setResetState(ResetState.Finish);
            return;
          }}
          discordstyle={ButtonStyle.Danger}
        >
          {t(
            resetState === ResetState.Default
              ? "resetEditor"
              : resetState === ResetState.Finish
                ? "resetFinished"
                : "resetEditorWarning",
          )}
        </Button>
      </div>
      {localHistory.length === 0 ? (
        <p>{t("noHistory")}</p>
      ) : (
        <div className="space-y-1">
          {[...localHistory]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .map((item, itemI) => {
              if ("messages" in item.data) {
                let embeds = 0;
                for (const message of item.data.messages) {
                  embeds += (message.data.embeds ?? []).length;
                }

                return (
                  <details
                    key={item.id}
                    className="group p-2 bg-gray-200 dark:bg-gray-700"
                  >
                    <summary className="group-open:mb-2 transition-[margin] marker:content-none marker-none flex text-base cursor-default select-none">
                      <CoolIcon
                        icon="Chevron_Right"
                        className="group-open:rotate-90 mr-2 my-auto transition-transform"
                      />
                      <span className="shrink-0 font-semibold">
                        {item.createdAt.toLocaleTimeString()}
                      </span>
                      <span className="truncate ml-1">
                        - {t("nMessage", { count: item.data.messages.length })},{" "}
                        {t("nEmbed", { count: embeds })}
                      </span>
                    </summary>
                    <div className="flex w-full">
                      <div className="bg-white dark:bg-primary-600 border border-gray-300 dark:border-transparent shadow rounded p-2 grow">
                        {item.data.messages.map((message, i) => (
                          <Message
                            key={`history-${item.id}-message-${i}`}
                            message={message.data}
                            date={item.createdAt}
                            index={i}
                            data={item.data as QueryData}
                            messageDisplay={settings.messageDisplay}
                            compactAvatars={settings.compactAvatars}
                          />
                        ))}
                      </div>
                      <div className="space-y-1 ml-2 text-xl">
                        <button
                          type="button"
                          className="block"
                          title={t("historyRestore")}
                          onClick={() => {
                            setData(item.data as Q);
                            setLocalHistory(
                              localHistory.filter((_, i) => i < itemI),
                            );
                            props.setOpen(false);
                          }}
                        >
                          <CoolIcon
                            icon="Redo"
                            className="text-blurple dark:text-blurple-400"
                          />
                        </button>
                        <button
                          type="button"
                          className="block"
                          title={t("historyRemove")}
                          onClick={() => {
                            setLocalHistory(
                              localHistory.filter((_, i) => i !== itemI),
                            );
                          }}
                        >
                          <CoolIcon
                            icon="Trash_Full"
                            className="text-rose-500 dark:text-rose-400"
                          />
                        </button>
                      </div>
                    </div>
                  </details>
                );
              } else {
                return (
                  <details
                    key={item.id}
                    className="group p-2 bg-gray-200 dark:bg-gray-700"
                  >
                    <summary className="group-open:mb-2 transition-[margin] marker:content-none marker-none flex text-base cursor-default select-none">
                      <CoolIcon
                        icon="Chevron_Right"
                        className="group-open:rotate-90 mr-2 my-auto transition-transform"
                      />
                      <span className="shrink-0 font-semibold">
                        {item.createdAt.toLocaleTimeString()}
                      </span>
                    </summary>
                    <div className="flex w-full">
                      <div className="bg-white dark:bg-primary-600 border border-gray-300 dark:border-transparent shadow rounded p-2 grow">
                        <Embed {...linkEmbedToAPIEmbed(item.data.embed.data)} />
                      </div>
                      <div className="space-y-1 ml-2 text-xl">
                        <button
                          type="button"
                          className="block"
                          title={t("historyRestore")}
                          onClick={() => {
                            setData(item.data as Q);
                            setLocalHistory(
                              localHistory.filter((_, i) => i < itemI),
                            );
                            props.setOpen(false);
                          }}
                        >
                          <CoolIcon
                            icon="Redo"
                            className="text-blurple dark:text-blurple-400"
                          />
                        </button>
                        <button
                          type="button"
                          className="block"
                          title={t("historyRemove")}
                          onClick={() => {
                            setLocalHistory(
                              localHistory.filter((_, i) => i !== itemI),
                            );
                          }}
                        >
                          <CoolIcon
                            icon="Trash_Full"
                            className="text-rose-500 dark:text-rose-400"
                          />
                        </button>
                      </div>
                    </div>
                  </details>
                );
              }
            })}
        </div>
      )}
    </Modal>
  );
};

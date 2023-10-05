import LocalizedStrings from "react-localization";
import { CoolIcon } from "~/components/CoolIcon";
import { Message } from "~/components/preview/Message";
import { HistoryItem } from "~/routes/_index";
import { QueryData } from "~/types/QueryData";
import { useLocalStorage } from "~/util/localstorage";
import { Modal, ModalProps } from "./Modal";

const strings = new LocalizedStrings({
  en: {
    title: "History",
    noHistory: "This editor session has no history recorded.",
    description:
      'This is cleared whenever the editor is loaded. If you need to store messages persistently, use the "Save Message" button.',
    xMessage: "{0} message",
    xMessages: "{0} messages",
    xEmbed: "{0} embed",
    xEmbeds: "{0} embeds",
  },
});

export const HistoryModal = (
  props: ModalProps & {
    localHistory: HistoryItem[];
    setLocalHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
    setData: React.Dispatch<React.SetStateAction<QueryData>>;
  }
) => {
  const { localHistory, setLocalHistory, setData } = props;
  const [settings] = useLocalStorage();

  return (
    <Modal title={strings.title} {...props}>
      {localHistory.length === 0 ? (
        <p>{strings.noHistory}</p>
      ) : (
        <div className="space-y-1">
          {localHistory.map((item, itemI) => {
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
                    -{" "}
                    {/*
                      I'm aware this is not how plurals work in all languages
                      This library doesn't have pluralization support
                      We might switch libraries or just use a generic "message(s)"
                    */}
                    {strings.formatString(
                      item.data.messages.length === 1
                        ? strings.xMessage
                        : strings.xMessages,
                      item.data.messages.length
                    )}
                    ,{" "}
                    {strings.formatString(
                      embeds === 1 ? strings.xEmbed : strings.xEmbeds,
                      embeds
                    )}
                  </span>
                </summary>
                <div className="flex w-full">
                  <div className="bg-white dark:bg-[#313338] border border-gray-300 dark:border-transparent shadow rounded p-2 grow">
                    {item.data.messages.map((message, i) => (
                      <Message
                        key={`history-${item.id}-message-${i}`}
                        message={message.data}
                        date={item.createdAt}
                        index={i}
                        data={item.data}
                        messageDisplay={settings.messageDisplay}
                        compactAvatars={settings.compactAvatars}
                      />
                    ))}
                  </div>
                  <div className="space-y-1 ml-2 text-xl">
                    <button
                      className="block"
                      onClick={() => {
                        setData(item.data);
                        setLocalHistory(
                          localHistory.filter((_, i) => i < itemI)
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
                      className="block"
                      onClick={() => {
                        setLocalHistory(
                          localHistory.filter((_, i) => i !== itemI)
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
          })}
        </div>
      )}
    </Modal>
  );
};

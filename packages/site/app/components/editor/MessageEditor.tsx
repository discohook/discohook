import { APIWebhook } from "discord-api-types/v10";
import { QueryData } from "~/types/QueryData";
import { Button } from "../Button";
import { CoolIcon } from "../CoolIcon";
import { InfoBox } from "../InfoBox";
import { TextArea } from "../TextArea";
import { AuthorType, getAuthorType } from "../preview/Message";
import { ActionRowEditor } from "./ComponentEditor";
import { EmbedEditor, getEmbedLength, getEmbedText } from "./EmbedEditor";

const strings = {
  embedsTooLarge:
    "Embeds must contain at most 6000 characters total (currently {0} too many)",
};

export const getMessageText = (
  message: QueryData["messages"][number]["data"],
): string | undefined =>
  message.content ??
  (message.embeds
    ? message.embeds.map(getEmbedText).find((t) => !!t)
    : undefined);

export const MessageEditor: React.FC<{
  data: QueryData;
  discordApplicationId: string;
  index: number;
  setData: React.Dispatch<React.SetStateAction<QueryData>>;
  setSettingMessageIndex: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
  webhooks?: APIWebhook[];
}> = ({
  index: i,
  data,
  discordApplicationId,
  setData,
  setSettingMessageIndex,
  webhooks,
}) => {
  const message = data.messages[i];
  const embedsLength =
    message.data.embeds && message.data.embeds.length > 0
      ? message.data.embeds.map(getEmbedLength).reduce((a, b) => a + b)
      : 0;
  const previewText = getMessageText(message.data);

  const authorTypes = webhooks
    ? webhooks.map((w) => getAuthorType(discordApplicationId, w))
    : [];
  const possiblyActionable = authorTypes.includes(AuthorType.ActionableWebhook);
  const possiblyApplication = authorTypes.includes(
    AuthorType.ApplicationWebhook,
  );

  return (
    <details className="group/message mt-4 pb-2" open>
      <summary className="group-open/message:mb-2 transition-[margin] marker:content-none marker-none flex font-semibold text-base cursor-default select-none">
        <CoolIcon
          icon="Chevron_Right"
          className="group-open/message:rotate-90 mr-2 my-auto transition-transform"
        />
        <span className="shrink-0">Message {i + 1}</span>
        {previewText && <span className="truncate ml-1">- {previewText}</span>}
        <div className="ml-auto space-x-2 my-auto shrink-0">
          <button
            className={i === 0 ? "hidden" : ""}
            onClick={() => {
              data.messages.splice(i, 1);
              data.messages.splice(i - 1, 0, message);
              setData({ ...data });
            }}
          >
            <CoolIcon icon="Chevron_Up" />
          </button>
          <button
            className={i === data.messages.length - 1 ? "hidden" : ""}
            onClick={() => {
              data.messages.splice(i, 1);
              data.messages.splice(i + 1, 0, message);
              setData({ ...data });
            }}
          >
            <CoolIcon icon="Chevron_Down" />
          </button>
          <button
            className={data.messages.length >= 10 ? "hidden" : ""}
            onClick={() => {
              data.messages.splice(i + 1, 0, structuredClone(message));
              setData({ ...data });
            }}
          >
            <CoolIcon icon="Copy" />
          </button>
          {data.messages.length > 1 && (
            <button
              onClick={() => {
                data.messages.splice(i, 1);
                setData({ ...data });
              }}
            >
              <CoolIcon icon="Trash_Full" />
            </button>
          )}
        </div>
      </summary>
      <div className="rounded bg-gray-100 dark:bg-gray-800 border-2 border-transparent dark:border-gray-700 p-2 dark:px-3 dark:-mx-1 mt-1 space-y-2">
        <TextArea
          label="Content"
          className="w-full h-40"
          value={message.data.content ?? undefined}
          maxLength={2000}
          onInput={(e) => {
            message.data.content = e.currentTarget.value || undefined;
            setData({ ...data });
          }}
        />
        {message.data.embeds && message.data.embeds.length > 0 && (
          <div className="mt-1 space-y-1">
            {embedsLength > 6000 && (
              <div className="-mb-2">
                <InfoBox severity="red" icon="Circle_Warning">
                  {strings.embedsTooLarge}
                  {/*strings.formatString(
                    strings.embedsTooLarge,
                    embedsLength - 6000
                  )*/}
                </InfoBox>
              </div>
            )}
            {message.data.embeds.map((embed, ei) => (
              <EmbedEditor
                key={`edit-message-${i}-embed-${ei}`}
                message={message}
                messageIndex={i}
                embed={embed}
                embedIndex={ei}
                data={data}
                setData={setData}
              />
            ))}
          </div>
        )}
        {message.data.components && message.data.components.length > 0 && (
          <>
            <p className="mt-1 text-lg font-semibold cursor-default select-none">
              Components
            </p>
            {!possiblyActionable && (
              <InfoBox icon="Info" collapsible open>
                {!webhooks || webhooks?.length === 0 ? (
                  <>
                    Component availability is dependent on the type of webhook
                    that you send a message with. In order to send link buttons,
                    the webhook must be created by an application (any bot), but
                    to send other buttons and select menus, the webhook must be
                    owned by the Boogiehook application (this website/its bot).
                    Add a webhook for more information.
                  </>
                ) : possiblyApplication ? (
                  <>
                    One or more of your webhooks are owned by an application,
                    but not Boogiehook, so you can only add link buttons. Add a
                    webhook owned by the Boogiehook bot to be able to use more
                    types of components.
                  </>
                ) : (
                  <>
                    None of your webhooks are compatibile with components. Add a
                    webhook owned by the Boogiehook bot.
                  </>
                )}
              </InfoBox>
            )}
            <div className="mt-1 space-y-1 rounded p-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 shadow">
              {message.data.components.map((row, ri) => (
                <div key={`edit-message-${i}-row-${ri}`}>
                  <ActionRowEditor
                    message={message}
                    row={row}
                    rowIndex={ri}
                    data={data}
                    setData={setData}
                    open
                  />
                  {ri < message.data.components!.length - 1 && (
                    <hr className="border border-gray-500/20 my-2" />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        <div className="flex">
          <Button onClick={() => setSettingMessageIndex(i)}>
            {message.reference ? "Change Reference" : "Set Reference"}
          </Button>
          <Button
            className="ml-auto"
            onClick={() => {
              message.data.embeds = message.data.embeds
                ? [...message.data.embeds, {}]
                : [{}];
              setData({ ...data });
            }}
            disabled={!!message.data.embeds && message.data.embeds.length >= 10}
          >
            Add Embed
          </Button>
          <Button
            className="ml-2"
            onClick={() => {
              const emptyRow = { type: 1, components: [] };
              message.data.components = message.data.components
                ? [...message.data.components, emptyRow]
                : [emptyRow];
              setData({ ...data });
            }}
            disabled={
              !!message.data.components && message.data.components.length >= 5
            }
          >
            {message.data.components && message.data.components.length >= 1
              ? "Add Row"
              : "Add Components"}
          </Button>
        </div>
      </div>
    </details>
  );
};
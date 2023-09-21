import { QueryData } from "~/types/QueryData";
import { Button } from "../Button";
import { TextArea } from "../TextArea";
import { EmbedEditor } from "./EmbedEditor";

export const MessageEditor: React.FC<{
  message: QueryData["messages"][number];
  index: number;
  data: QueryData;
  setData: React.Dispatch<React.SetStateAction<QueryData>>;
  setSettingMessageIndex: React.Dispatch<
    React.SetStateAction<number | undefined>
  >;
}> = ({ message, index: i, data, setData, setSettingMessageIndex }) => {
  return (
    <div className="mt-4">
      <div className="font-semibold text-base flex">
        Message #{i + 1}
        <div className="ml-auto space-x-1"></div>
      </div>
      <div className="rounded bg-gray-100 p-2 mt-1 space-y-2">
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
        <div className="flex">
          <Button onClick={() => setSettingMessageIndex(i)}>
            Set Reference
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
        </div>
      </div>
    </div>
  );
};

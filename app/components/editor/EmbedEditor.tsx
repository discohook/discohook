import { APIEmbed } from "discord-api-types/v10";
import { QueryData } from "~/types/QueryData";
import { Button } from "../Button";
import { TextArea } from "../TextArea";
import { TextInput } from "../TextInput";

export const EmbedEditor: React.FC<{
  message: QueryData["messages"][number];
  messageIndex: number;
  embed: APIEmbed;
  embedIndex: number;
  data: QueryData;
  setData: React.Dispatch<React.SetStateAction<QueryData>>;
}> = ({ message, messageIndex: mi, embed, embedIndex: i, data, setData }) => {
  const updateEmbed = (partialEmbed: Partial<APIEmbed>) =>
    setData({
      ...data,
      messages: data.messages.splice(mi, 1, {
        ...message,
        data: {
          ...message.data,
          embeds: message.data.embeds!.splice(i, 1, {
            ...embed,
            ...partialEmbed,
          }),
        },
      }),
    });
  return (
    <div className="rounded p-4 bg-gray-400">
      <div className="flex">
        <div className="grow">
          <TextInput
            label="Title"
            className="w-full"
            maxLength={256}
            value={embed.title}
            onInput={(e) =>
              updateEmbed({
                title: e.currentTarget.value,
              })
            }
          />
        </div>
        {embed.url === undefined && (
          <Button
            className="ml-2 mt-auto shrink-0"
            onClick={() => updateEmbed({ url: location.origin })}
          >
            Add URL
          </Button>
        )}
      </div>
      <div className="grid gap-2 mt-2">
        {embed.url !== undefined && (
          <div className="flex">
            <div className="grow">
              <TextInput
                label="Title URL"
                className="w-full"
                type="url"
                value={embed.url}
                onInput={(e) =>
                  updateEmbed({
                    url: e.currentTarget.value,
                  })
                }
              />
            </div>
            <Button
              className="ml-2 mt-auto shrink-0"
              onClick={() => updateEmbed({ url: undefined })}
            >
              Remove
              <span className="hidden sm:inline"> URL</span>
            </Button>
          </div>
        )}
        <TextInput
          label="Sidebar Color"
          className="w-full"
          value={embed.color ? `#${embed.color.toString(16)}` : undefined}
          onInput={(e) =>
            updateEmbed({
              color: e.currentTarget.value
                ? Number(e.currentTarget.value)
                : undefined,
            })
          }
        />
      </div>
      <TextArea
        label="Description"
        className="w-full h-40"
        value={embed.description ?? undefined}
        maxLength={2000}
        onInput={(e) =>
          updateEmbed({
            description: e.currentTarget.value,
          })
        }
      />
    </div>
  );
};

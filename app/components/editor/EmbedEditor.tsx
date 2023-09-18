import { APIEmbed } from "discord-api-types/v10";
import { QueryData } from "~/types/QueryData";
import { Button } from "../Button";
import { CoolIcon } from "../CoolIcon";
import { TextArea } from "../TextArea";
import { TextInput } from "../TextInput";
import { ColorPicker } from "./ColorPicker";

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
    <div
      className="rounded p-2 bg-gray-400 border-l-4 border-l-gray-500"
      style={
        embed.color
          ? {
              borderLeftColor: `#${embed.color.toString(16)}`,
            }
          : undefined
      }
    >
      <EmbedEditorSection name="Author">
        <div className="flex">
          <div className="grow">
            <TextInput
              label="Name"
              className="w-full"
              maxLength={256}
              value={embed.author?.name}
              onInput={(e) =>
                updateEmbed({
                  author: {
                    ...(embed.author ?? {}),
                    name: e.currentTarget.value,
                  },
                })
              }
            />
          </div>
          {embed.author?.url === undefined && (
            <Button
              className="ml-2 mt-auto shrink-0"
              onClick={() =>
                updateEmbed({
                  author: {
                    ...(embed.author ?? { name: "" }),
                    url: location.origin,
                  },
                })
              }
            >
              Add URL
            </Button>
          )}
        </div>
        <div className="grid gap-2 mt-2">
          {embed.author?.url !== undefined && (
            <div className="flex">
              <div className="grow">
                <TextInput
                  label="Author URL"
                  className="w-full"
                  type="url"
                  value={embed.author?.url}
                  onInput={(e) =>
                    updateEmbed({
                      author: {
                        ...(embed.author ?? { name: "" }),
                        url: e.currentTarget.value,
                      },
                    })
                  }
                />
              </div>
              <Button
                className="ml-2 mt-auto shrink-0"
                onClick={() =>
                  updateEmbed({
                    author: {
                      ...(embed.author ?? { name: "" }),
                      url: undefined,
                    },
                  })
                }
              >
                Remove
                <span className="hidden sm:inline"> URL</span>
              </Button>
            </div>
          )}
          <TextInput
            label="Icon URL"
            className="w-full"
            type="url"
            value={embed.author?.icon_url}
            onInput={(e) =>
              updateEmbed({
                author: {
                  ...(embed.author ?? { name: "" }),
                  icon_url: e.currentTarget.value,
                },
              })
            }
          />
        </div>
      </EmbedEditorSection>
      <EmbedEditorSection name="Body">
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
          <details className="relative">
            <summary className="flex cursor-pointer">
              <div className="grow">
                <p className="text-sm font-medium">Sidebar Color</p>
                <p className="rounded border h-9 py-0 px-[14px] bg-gray-200 dark:bg-gray-700">
                  <span className="align-middle">
                    {embed.color
                      ? `#${embed.color.toString(16)}`
                      : "Click to set"}
                  </span>
                </p>
              </div>
              <div
                className="h-9 w-9 mt-auto rounded ml-2 bg-gray-500"
                style={{
                  backgroundColor: embed.color
                    ? `#${embed.color.toString(16)}`
                    : undefined,
                }}
              />
            </summary>
            <ColorPicker
              color={embed.color ? `#${embed.color.toString(16)}` : undefined}
              onChange={(color) => {
                updateEmbed({
                  color:
                    color.rgb.a === 0
                      ? undefined
                      : parseInt(color.hex.replace("#", "0x"), 16),
                });
              }}
            />
          </details>
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
      </EmbedEditorSection>
    </div>
  );
};

export const EmbedEditorSection: React.FC<
  React.PropsWithChildren<{ name: string; open?: boolean }>
> = ({ name, open, children }) => {
  return (
    <details className="group p-2" open={open}>
      <summary className="group-open:mb-2 transition-[margin] marker:content-none flex text-semibold cursor-default">
        <CoolIcon
          icon="Chevron_Right"
          className="group-open:rotate-90 mr-2 my-auto transition-transform"
        />
        {name}
      </summary>
      <div>{children}</div>
    </details>
  );
};

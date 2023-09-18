import { APIEmbed } from "discord-api-types/v10";
import { QueryData } from "~/types/QueryData";
import { Button } from "../Button";
import { CoolIcon } from "../CoolIcon";
import { TextArea } from "../TextArea";
import { TextInput } from "../TextInput";
import { ColorPicker } from "./ColorPicker";

export const isEmbedEmpty = (embed: APIEmbed): boolean =>
  !embed.author &&
  !embed.title &&
  !embed.description &&
  (!embed.fields || embed.fields.length === 0) &&
  !embed.image?.url &&
  !embed.thumbnail?.url &&
  !embed.footer;

export const getEmbedText = (embed: APIEmbed): string | undefined =>
  embed.author?.name ||
  embed.title ||
  (embed.fields ? embed.fields.find((f) => !!f.name)?.name : undefined) ||
  embed.description ||
  embed.footer?.text;

export const EmbedEditor: React.FC<{
  message: QueryData["messages"][number];
  messageIndex: number;
  embed: APIEmbed;
  embedIndex: number;
  data: QueryData;
  setData: React.Dispatch<React.SetStateAction<QueryData>>;
  open?: boolean;
}> = ({ message, messageIndex: mi, embed, embedIndex: i, data, setData, open }) => {
  const updateEmbed = (partialEmbed: Partial<APIEmbed>) => {
    if (
      partialEmbed.author &&
      !partialEmbed.author.name &&
      !partialEmbed.author.icon_url &&
      !partialEmbed.author.url
    ) {
      partialEmbed.author = undefined;
    }
    if (
      partialEmbed.footer &&
      !partialEmbed.footer.text &&
      !partialEmbed.footer.icon_url
    ) {
      partialEmbed.footer = undefined;
    }

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
  };

  const previewText = getEmbedText(embed);
  return (
    <details
      className="group/embed rounded p-2 bg-gray-400 border-l-4 border-l-gray-500"
      open={open}
      style={
        embed.color
          ? {
              borderLeftColor: `#${embed.color.toString(16)}`,
            }
          : undefined
      }
    >
      <summary className="group-open/embed:mb-2 py-1 transition-[margin] marker:content-none marker-none flex text-lg font-semibold cursor-default select-none">
        <CoolIcon
          icon="Chevron_Right"
          className="group-open/embed:rotate-90 mr-2 my-auto transition-transform"
        />
        <span className="shrink-0">Embed {i + 1}</span>
        {previewText ? <span className="truncate ml-1">- {previewText}</span> : ""}
      </summary>
      <EmbedEditorSection name="Author" open={open}>
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
                    name: e.currentTarget.value.trim(),
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
      <hr className="border border-gray-500/20" />
      <EmbedEditorSection name="Body" open={open}>
        <div className="flex">
          <div className="grow">
            <TextInput
              label="Title"
              className="w-full"
              maxLength={256}
              value={embed.title}
              onInput={(e) =>
                updateEmbed({
                  title: e.currentTarget.value.trim() || undefined,
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
        <div className="grid gap-2">
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
                      url: e.currentTarget.value.trim(),
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
              description: e.currentTarget.value.trim() || undefined,
            })
          }
        />
      </EmbedEditorSection>
    </details>
  );
};

export const EmbedEditorSection: React.FC<
  React.PropsWithChildren<{ name: string; open?: boolean }>
> = ({ name, open, children }) => {
  return (
    <details className="group/section p-2" open={open}>
      <summary className="group-open/section:mb-2 transition-[margin] marker:content-none marker-none flex text-base text-gray-600 font-semibold cursor-default select-none">
        <CoolIcon
          icon="Chevron_Right"
          className="group-open/section:rotate-90 mr-2 my-auto transition-transform"
        />
        {name}
      </summary>
      <div className="space-y-2">{children}</div>
    </details>
  );
};

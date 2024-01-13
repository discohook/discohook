import { APIEmbed, APIEmbedField } from "discord-api-types/v10";
import { QueryData } from "~/types/QueryData";
import { randomString } from "~/util/text";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { CoolIcon } from "../CoolIcon";
import { InfoBox } from "../InfoBox";
import { TextArea } from "../TextArea";
import { TextInput } from "../TextInput";

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

export const getEmbedLength = (embed: APIEmbed) => {
  let totalCharacters =
    (embed.title ?? "").length +
    (embed.description ?? "").length +
    (embed.author?.name ?? "").length +
    (embed.footer?.text ?? "").length;

  const fieldLengths = (embed.fields ?? []).map(
    (f) => f.name.length + f.value.length,
  );
  if (fieldLengths.length > 0) {
    totalCharacters += fieldLengths.reduce((a, b) => a + b);
  }
  return totalCharacters;
};

export const getEmbedErrors = (embed: APIEmbed) => {
  const errors: string[] = [];

  const totalCharacters = getEmbedLength(embed);
  if (totalCharacters === 0 && !embed.image?.url && !embed.thumbnail?.url) {
    errors.push(strings.embedEmpty);
  }

  return errors;
};

const strings = {
  embedEmpty: "Must contain text or an image",
};

export const EmbedEditor: React.FC<{
  message: QueryData["messages"][number];
  messageIndex: number;
  embed: APIEmbed;
  embedIndex: number;
  data: QueryData;
  setData: React.Dispatch<React.SetStateAction<QueryData>>;
  open?: boolean;
}> = ({
  message,
  messageIndex: mi,
  embed,
  embedIndex: i,
  data,
  setData,
  open,
}) => {
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

    message.data.embeds!.splice(i, 1, {
      ...embed,
      ...partialEmbed,
    });

    setData({ ...data });
  };

  // The first embed in the gallery is the parent that the children will be merged into
  const galleryEmbeds = message.data.embeds!.filter(
    (e) => embed.url && e.url === embed.url,
  );
  const galleryChildren = galleryEmbeds.slice(1);
  const isChild = galleryChildren.includes(embed);

  const localIndex = isChild ? galleryChildren.indexOf(embed) : i;
  const localIndexMax = isChild
    ? galleryChildren.length - 1
    : message.data.embeds!.length - 1;
  const localMaxMembers = isChild ? 3 : 10;

  const previewText = getEmbedText(embed);
  const errors = getEmbedErrors(embed);
  return (
    <details
      className="group/embed rounded p-2 bg-gray-100 dark:bg-gray-800 border border-l-4 border-gray-300 dark:border-gray-700 border-l-gray-500 dark:border-l-[#1E1F22] shadow"
      open={open}
      style={
        embed.color
          ? {
              borderLeftColor: `#${embed.color.toString(16)}`,
            }
          : undefined
      }
    >
      <summary className="group-open/embed:mb-2 py-1 px-1 transition-[margin] marker:content-none marker-none flex text-lg font-semibold cursor-default select-none">
        <CoolIcon
          icon="Chevron_Right"
          className="group-open/embed:rotate-90 mr-2 my-auto transition-transform"
        />
        {errors.length > 0 && (
          <CoolIcon
            icon="Circle_Warning"
            className="my-auto text-rose-600 dark:text-rose-400 mr-1.5"
          />
        )}
        {isChild ? (
          <>
            <span className="shrink-0">Gallery Image {localIndex + 2}</span>
            {embed.image?.url && (
              <span className="truncate ml-1"> - {embed.image.url}</span>
            )}
          </>
        ) : (
          <>
            <span className="shrink-0">Embed {i + 1}</span>
            {previewText ? (
              <span className="truncate ml-1">- {previewText}</span>
            ) : (
              ""
            )}
          </>
        )}
        <div className="ml-auto text-xl space-x-2.5 my-auto shrink-0">
          {!isChild && (
            // Was having issues with this, may re-introduce later
            // For now users just have to manually move gallery items
            <>
              <button
                className={localIndex === 0 ? "hidden" : ""}
                onClick={() => {
                  message.data.embeds!.splice(i, 1);
                  message.data.embeds!.splice(i - 1, 0, embed);
                  setData({ ...data });
                }}
              >
                <CoolIcon icon="Chevron_Up" />
              </button>
              <button
                className={localIndex === localIndexMax ? "hidden" : ""}
                onClick={() => {
                  message.data.embeds!.splice(i, 1);
                  message.data.embeds!.splice(i + 1, 0, embed);
                  setData({ ...data });
                }}
              >
                <CoolIcon icon="Chevron_Down" />
              </button>
              <button
                className={localIndexMax + 1 >= localMaxMembers ? "hidden" : ""}
                onClick={() => {
                  message.data.embeds!.splice(i + 1, 0, structuredClone(embed));
                  setData({ ...data });
                }}
              >
                <CoolIcon icon="Copy" />
              </button>
            </>
          )}
          <button
            onClick={() => {
              message.data.embeds!.splice(i, 1);
              setData({ ...data });
            }}
          >
            <CoolIcon icon="Trash_Full" />
          </button>
        </div>
      </summary>
      {errors.length > 0 && (
        <div className="-mt-1 mb-1">
          <InfoBox severity="red" icon="Circle_Warning">
            {errors.join("\n")}
          </InfoBox>
        </div>
      )}
      {!isChild && (
        <>
          <EmbedEditorSection name="Author" open={open}>
            <div className="flex">
              <div className="grow">
                <TextInput
                  label="Name"
                  className="w-full"
                  maxLength={256}
                  value={embed.author?.name ?? ""}
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
                      value={embed.author?.url ?? ""}
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
                value={embed.author?.icon_url ?? ""}
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
        </>
      )}
      <EmbedEditorSection name="Body" open={open}>
        {!isChild && (
          <>
            <div className="flex">
              <div className="grow">
                <TextInput
                  label="Title"
                  className="w-full"
                  maxLength={256}
                  value={embed.title ?? ""}
                  onInput={(e) =>
                    updateEmbed({
                      title: e.currentTarget.value || undefined,
                    })
                  }
                />
              </div>
              {embed.url === undefined && (
                <Button
                  className="ml-2 mt-auto shrink-0"
                  onClick={() =>
                    updateEmbed({
                      url: location.origin + `#default-${randomString(8)}`,
                    })
                  }
                >
                  Add URL
                </Button>
              )}
            </div>
          </>
        )}
        <div className="grid gap-2">
          {(isChild || embed.url !== undefined) && (
            <div className="flex">
              <div className="grow">
                <TextInput
                  label="Title URL"
                  description={
                    isChild
                      ? "This is set automatically by the main embed in the gallery. Only change this if you want to change which gallery this image belongs to."
                      : undefined
                  }
                  className="w-full"
                  type="url"
                  value={embed.url ?? ""}
                  onInput={(e) => {
                    for (const emb of galleryEmbeds) {
                      emb.url = e.currentTarget.value;
                    }
                    setData({ ...data });
                  }}
                />
              </div>
              <Button
                disabled={isChild}
                className="ml-2 mt-auto shrink-0"
                onClick={() => {
                  embed.url = undefined;
                  message.data.embeds = message.data.embeds!.filter(
                    (e) => !galleryChildren.includes(e),
                  );
                  setData({ ...data });
                }}
              >
                Remove
                <span className="hidden sm:inline"> URL</span>
              </Button>
            </div>
          )}
          {!isChild && (
            <details className="relative">
              <summary className="flex cursor-pointer">
                <div className="grow">
                  <p className="text-sm font-medium">Sidebar Color</p>
                  <p className="rounded border h-9 py-0 px-[14px] bg-gray-300 dark:border-transparent dark:bg-[#292b2f]">
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
              {/* <ColorPicker
                color={embed.color ? `#${embed.color.toString(16)}` : undefined}
                onChange={(color) => {
                  updateEmbed({
                    color:
                      color.rgb.a === 0
                        ? undefined
                        : parseInt(color.hex.replace("#", "0x"), 16),
                  });
                }}
              /> */}
            </details>
          )}
        </div>
        {!isChild && (
          <TextArea
            label="Description"
            className="w-full h-40"
            value={embed.description ?? ""}
            maxLength={4096}
            onInput={(e) =>
              updateEmbed({
                description: e.currentTarget.value || undefined,
              })
            }
          />
        )}
      </EmbedEditorSection>
      <hr className="border border-gray-500/20" />
      {!isChild && (
        <>
          <EmbedEditorSection name="Fields" open={open}>
            {embed.fields && (
              <div className="ml-2 md:ml-4 transition-[margin-left]">
                {embed.fields.map((field, fi) => (
                  <EmbedFieldEditorSection
                    key={`edit-message-${mi}-embed-${i}-field-${fi}`}
                    embed={embed}
                    updateEmbed={updateEmbed}
                    field={field}
                    index={fi}
                    open={open}
                  >
                    <div className="flex">
                      <div className="grow">
                        <TextInput
                          label="Name"
                          value={field.name}
                          maxLength={256}
                          className="w-full"
                          onInput={(e) => {
                            field.name = e.currentTarget.value;
                            updateEmbed({});
                          }}
                        />
                      </div>
                      <div className="ml-2 my-auto">
                        <Checkbox
                          label="Inline"
                          checked={field.inline ?? false}
                          onChange={(e) => {
                            field.inline = e.currentTarget.checked;
                            updateEmbed({});
                          }}
                        />
                      </div>
                    </div>
                    <TextArea
                      label="Value"
                      value={field.value}
                      maxLength={1024}
                      className="w-full"
                      onInput={(e) => {
                        field.value = e.currentTarget.value;
                        updateEmbed({});
                      }}
                    />
                  </EmbedFieldEditorSection>
                ))}
              </div>
            )}
            <Button
              disabled={!!embed.fields && embed.fields.length >= 25}
              onClick={() =>
                updateEmbed({
                  fields: [...(embed.fields ?? []), { name: "", value: "" }],
                })
              }
            >
              Add Field
            </Button>
          </EmbedEditorSection>
          <hr className="border border-gray-500/20" />
        </>
      )}
      <EmbedEditorSection name="Images" open={isChild || open}>
        <div className="flex">
          <div className="grow">
            <TextInput
              label="Large Image URL"
              type="url"
              className="w-full"
              value={embed.image?.url ?? ""}
              onInput={(e) =>
                updateEmbed({ image: { url: e.currentTarget.value } })
              }
            />
          </div>
          {!galleryChildren.includes(embed) && (
            <Button
              className="ml-2 mt-auto shrink-0"
              disabled={
                !embed.image?.url ||
                message.data.embeds!.length >= 10 ||
                galleryEmbeds.length >= 4
              }
              onClick={() => {
                const url =
                  embed.url || location.origin + `#gallery-${randomString(8)}`;
                embed.url = url;
                message.data.embeds = message.data.embeds ?? [];
                message.data.embeds.splice(i + 1, 0, { url });
                setData({ ...data });
              }}
            >
              Add Another
            </Button>
          )}
        </div>
        {!isChild && (
          <TextInput
            label="Thumbnail URL"
            type="url"
            className="w-full"
            value={embed.thumbnail?.url ?? ""}
            onInput={(e) =>
              updateEmbed({ thumbnail: { url: e.currentTarget.value } })
            }
          />
        )}
      </EmbedEditorSection>
      {!isChild && (
        <>
          <hr className="border border-gray-500/20" />
          <EmbedEditorSection name="Footer" open={open}>
            <div className="flex">
              <div className="grow">
                <TextInput
                  label="Text"
                  className="w-full"
                  maxLength={2048}
                  value={embed.footer?.text ?? ""}
                  onInput={(e) =>
                    updateEmbed({
                      footer: {
                        ...(embed.footer ?? {}),
                        text: e.currentTarget.value,
                      },
                    })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2 mt-2">
              <TextInput
                label="Icon URL"
                className="w-full"
                type="url"
                value={embed.footer?.icon_url ?? ""}
                onInput={(e) =>
                  updateEmbed({
                    footer: {
                      ...(embed.footer ?? { text: "" }),
                      icon_url: e.currentTarget.value,
                    },
                  })
                }
              />
            </div>
          </EmbedEditorSection>
        </>
      )}
    </details>
  );
};

export const EmbedEditorSection: React.FC<
  React.PropsWithChildren<{ name: string; open?: boolean }>
> = ({ name, open, children }) => {
  return (
    <details className="group/section p-2" open={open}>
      <summary className="group-open/section:mb-2 transition-[margin] marker:content-none marker-none flex text-base text-gray-600 dark:text-gray-400 font-semibold cursor-default select-none">
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

export const EmbedFieldEditorSection: React.FC<
  React.PropsWithChildren<{
    embed: APIEmbed;
    updateEmbed: (partialEmbed: Partial<APIEmbed>) => void;
    field: APIEmbedField;
    index: number;
    open?: boolean;
  }>
> = ({ embed, updateEmbed, field, index, open, children }) => {
  const previewText = field.name.trim() || field.value.trim();
  return (
    <details className="group/field pb-2 -my-1" open={open}>
      <summary className="group-open/field:mb-2 transition-[margin] marker:content-none marker-none flex text-base text-gray-600 dark:text-gray-400 font-semibold cursor-default select-none">
        <CoolIcon
          icon="Chevron_Right"
          className="group-open/field:rotate-90 mr-2 my-auto transition-transform"
        />
        <span className="shrink-0">Field {index + 1}</span>
        {previewText && <span className="truncate ml-1">- {previewText}</span>}
        <div className="ml-auto text-lg space-x-2.5 my-auto shrink-0">
          <button
            className={index === 0 ? "hidden" : ""}
            onClick={() => {
              embed.fields!.splice(index, 1);
              embed.fields!.splice(index - 1, 0, field);
              updateEmbed({});
            }}
          >
            <CoolIcon icon="Chevron_Up" />
          </button>
          <button
            className={index === embed.fields!.length - 1 ? "hidden" : ""}
            onClick={() => {
              embed.fields!.splice(index, 1);
              embed.fields!.splice(index + 1, 0, field);
              updateEmbed({});
            }}
          >
            <CoolIcon icon="Chevron_Down" />
          </button>
          <button
            className={embed.fields!.length >= 25 ? "hidden" : ""}
            onClick={() => {
              embed.fields!.splice(index + 1, 0, structuredClone(field));
              updateEmbed({});
            }}
          >
            <CoolIcon icon="Copy" />
          </button>
          <button
            onClick={() => {
              embed.fields!.splice(index, 1);
              updateEmbed({});
            }}
          >
            <CoolIcon icon="Trash_Full" />
          </button>
        </div>
      </summary>
      <div className="space-y-2">{children}</div>
    </details>
  );
};

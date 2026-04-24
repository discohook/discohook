import { Collapsible } from "@base-ui-components/react/collapsible";
import type { RESTAPIPoll } from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import type { QueryData } from "~/types/QueryData";
import type { CacheManager } from "~/util/cache/CacheManager";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { collapsibleStyles } from "../collapsible";
import { CoolIcon } from "../icons/CoolIcon";
import { InfoBox } from "../InfoBox";
import { TextInput } from "../TextInput";
import { PopoutEmojiPicker } from "./EmojiPicker";

export const createEmptyPollAnswer = (): RESTAPIPoll["answers"][number] => ({
  poll_media: { text: "" },
});

export const createEmptyPoll = (): RESTAPIPoll => ({
  question: { text: "" },
  answers: [createEmptyPollAnswer()],
});

const PollAnswerEditor = ({
  answer,
  index,
  answersCount,
  disabled,
  cache,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: {
  answer: RESTAPIPoll["answers"][number];
  index: number;
  answersCount: number;
  disabled: boolean;
  cache?: CacheManager;
  onUpdate: (updated: RESTAPIPoll["answers"][number]) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) => {
  const { t } = useTranslation();
  const previewText = answer.poll_media.text?.trim();

  return (
    <Collapsible.Root className="group/poll-answer -my-1 pb-2" defaultOpen>
      <div className="flex items-center">
        <Collapsible.Trigger className="group/poll-answer-trigger flex min-w-0 grow cursor-default select-none items-center text-base font-semibold text-gray-600 dark:text-gray-400">
          <CoolIcon
            icon="Chevron_Right"
            rtl="Chevron_Left"
            className="my-auto ltr:me-2 rtl:ms-2 transition-transform ltr:group-data-[panel-open]/poll-answer-trigger:rotate-90 rtl:group-data-[panel-open]/poll-answer-trigger:-rotate-90"
          />
          <span className="truncate">
            {`Answer ${index + 1}`}
            {previewText ? ` - ${previewText}` : ""}
          </span>
        </Collapsible.Trigger>
        <div className="ms-auto my-auto shrink-0 space-x-2.5 text-lg rtl:space-x-reverse">
          <button
            type="button"
            className={index === 0 ? "hidden" : undefined}
            disabled={disabled}
            onClick={onMoveUp}
          >
            <CoolIcon icon="Chevron_Up" />
          </button>
          <button
            type="button"
            className={index === answersCount - 1 ? "hidden" : undefined}
            disabled={disabled}
            onClick={onMoveDown}
          >
            <CoolIcon icon="Chevron_Down" />
          </button>
          <button
            type="button"
            className={answersCount >= 10 ? "hidden" : undefined}
            title={t("copy")}
            disabled={disabled}
            onClick={onDuplicate}
          >
            <CoolIcon icon="Copy" />
          </button>
          <button
            type="button"
            title="Delete Answer"
            className={answersCount <= 1 ? "hidden" : undefined}
            disabled={disabled}
            onClick={onDelete}
          >
            <CoolIcon icon="Trash_Full" />
          </button>
        </div>
      </div>
      <Collapsible.Panel
        className={twJoin(collapsibleStyles.editorPanel, "pt-2")}
      >
        <div className="flex items-end gap-2">
          <div className="shrink-0">
            <p className="cursor-default text-sm font-medium">{t("emoji")}</p>
            <PopoutEmojiPicker
              cache={cache}
              disabled={disabled}
              emoji={
                answer.poll_media.emoji
                  ? {
                      id: answer.poll_media.emoji.id,
                      name: answer.poll_media.emoji.name,
                      animated: answer.poll_media.emoji.animated,
                    }
                  : undefined
              }
              emojis={cache ? cache.emoji.getAll() : []}
              setEmoji={(emoji) => {
                onUpdate({
                  ...answer,
                  poll_media: {
                    ...answer.poll_media,
                    emoji: emoji
                      ? {
                          id: emoji.id,
                          name: emoji.name,
                          animated: emoji.animated,
                        }
                      : undefined,
                  },
                });
              }}
            />
          </div>
          <div className="grow">
            <TextInput
              label={t("text")}
              className="w-full"
              maxLength={55}
              required
              t={t}
              disabled={disabled}
              value={answer.poll_media.text ?? ""}
              onInput={(e) => {
                onUpdate({
                  ...answer,
                  poll_media: {
                    ...answer.poll_media,
                    text: e.currentTarget.value || undefined,
                  },
                });
              }}
            />
          </div>
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};

export const PollEditor: React.FC<{
  poll: RESTAPIPoll;
  message: QueryData["messages"][number];
  data: QueryData;
  setData: React.Dispatch<QueryData>;
  cache?: CacheManager;
}> = ({ poll, message, data, setData, cache }) => {
  const { t } = useTranslation();
  const previewText = poll.question.text?.trim();
  const disabled = !!message.reference;

  const updatePoll = (updated: RESTAPIPoll) => {
    message.data.poll = updated;
    setData({ ...data });
  };

  return (
    <Collapsible.Root
      className="group/poll rounded-lg border border-gray-300 bg-gray-100 p-2 ps-4 shadow dark:border-gray-700 dark:bg-gray-800"
      defaultOpen
    >
      <div className="flex items-center text-gray-600 dark:text-gray-400">
        <Collapsible.Trigger className="group/poll-trigger flex grow items-center truncate text-lg font-semibold">
          <CoolIcon
            icon="Chevron_Right"
            className="me-2 transition-transform group-data-[panel-open]/poll-trigger:rotate-90"
          />
          <p className="truncate">
            Poll
            {previewText ? ` - ${previewText}` : ""}
          </p>
        </Collapsible.Trigger>
        <div className="ms-auto shrink-0 text-xl">
          <button
            type="button"
            title="Delete Poll"
            disabled={disabled}
            onClick={() => {
              message.data.poll = undefined;
              setData({ ...data });
            }}
          >
            <CoolIcon icon="Trash_Full" />
          </button>
        </div>
      </div>
      <Collapsible.Panel
        className={twJoin(collapsibleStyles.editorPanel, "pt-2")}
      >
        <div className="space-y-2">
          {disabled && (
            <InfoBox severity="blue" icon="Info">
              Polls cannot be edited for existing messages.
            </InfoBox>
          )}
          <TextInput
            label="Question"
            className="w-full"
            maxLength={300}
            required
            t={t}
            disabled={disabled}
            value={poll.question.text ?? ""}
            onInput={(e) => {
              updatePoll({
                ...poll,
                question: {
                  ...poll.question,
                  text: e.currentTarget.value || undefined,
                },
              });
            }}
          />
          <div>
            {poll.answers.map((answer, index) => (
              <PollAnswerEditor
                key={`poll-answer-${index}`}
                answer={answer}
                index={index}
                answersCount={poll.answers.length}
                disabled={disabled}
                cache={cache}
                onUpdate={(updatedAnswer) => {
                  const answers = [...poll.answers];
                  answers.splice(index, 1, updatedAnswer);
                  updatePoll({ ...poll, answers });
                }}
                onMoveUp={() => {
                  if (index === 0) return;
                  const answers = [...poll.answers];
                  answers.splice(index, 1);
                  answers.splice(index - 1, 0, answer);
                  updatePoll({ ...poll, answers });
                }}
                onMoveDown={() => {
                  if (index === poll.answers.length - 1) return;
                  const answers = [...poll.answers];
                  answers.splice(index, 1);
                  answers.splice(index + 1, 0, answer);
                  updatePoll({ ...poll, answers });
                }}
                onDuplicate={() => {
                  if (poll.answers.length >= 10) return;
                  const answers = [...poll.answers];
                  answers.splice(index + 1, 0, structuredClone(answer));
                  updatePoll({ ...poll, answers });
                }}
                onDelete={() => {
                  if (poll.answers.length <= 1) return;
                  updatePoll({
                    ...poll,
                    answers: poll.answers.filter((_, i) => i !== index),
                  });
                }}
              />
            ))}
            <div>
              <Button
                onClick={() => {
                  if (poll.answers.length >= 10) return;
                  updatePoll({
                    ...poll,
                    answers: [...poll.answers, createEmptyPollAnswer()],
                  });
                }}
                disabled={disabled || poll.answers.length >= 10}
              >
                Add Answer
              </Button>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <TextInput
              label="Duration (hours)"
              className="w-full md:w-36"
              type="number"
              min={1}
              max={32}
              step={1}
              placeholder="24"
              disabled={disabled}
              value={poll.duration?.toString() ?? ""}
              onInput={(e) => {
                const value = e.currentTarget.value;
                const parsed = Number(value);
                updatePoll({
                  ...poll,
                  duration:
                    value === "" || !Number.isFinite(parsed)
                      ? undefined
                      : Math.min(32, Math.max(1, Math.trunc(parsed))),
                });
              }}
            />
            <div className="mb-1">
              <Checkbox
                label="Allow Multiple Answers"
                checked={poll.allow_multiselect ?? false}
                disabled={disabled}
                onCheckedChange={(checked) => {
                  updatePoll({
                    ...poll,
                    allow_multiselect: checked ? true : undefined,
                  });
                }}
              />
            </div>
          </div>
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};

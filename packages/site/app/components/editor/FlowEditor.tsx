import { ChannelType } from "discord-api-types/v10";
import { Trans, useTranslation } from "react-i18next";
import {
  Flow,
  FlowAction,
  FlowActionCreateThread,
  FlowActionSetVariableType,
  FlowActionType,
} from "~/store.server";
import { Button } from "../Button";
import { InfoBox } from "../InfoBox";
import { StringSelect } from "../StringSelect";
import { TextInput } from "../TextInput";
import { CoolIcon } from "../icons/CoolIcon";

type FlowWithPartials = Flow & {
  actions: (Partial<FlowAction> & Pick<FlowAction, "type">)[];
};

export const FlowEditor: React.FC<{
  flow: Flow;
  setFlow: (flow: Flow) => void;
}> = ({ flow, setFlow }) => {
  return (
    <div className="space-y-2 sm:ml-2">
      {/* <TextInput
        label="Name"
        className="w-full h-40"
        value={flow.name}
        maxLength={100}
        required
        onInput={(e) => {
          setFlow({ ...flow, name: e.currentTarget.value });
        }}
      /> */}
      {flow.actions.length > 0 && (
        <div className="mt-1 space-y-1">
          {flow.actions.length === 10 && (
            <div className="-mb-2">
              <InfoBox severity="yellow" icon="Circle_Warning">
                <Trans count={flow.actions.length}>
                  Warning about action count limit for non-premium users
                </Trans>
              </InfoBox>
            </div>
          )}
          {flow.actions.map((action, ai) => (
            <FlowActionEditor
              key={`edit-flow-action-${ai}`}
              flow={flow}
              action={action}
              actionIndex={ai}
              update={() => {
                setFlow(structuredClone(flow));
              }}
            />
          ))}
        </div>
      )}
      <Button
        onClick={() => {
          flow.actions.push({ type: 0 });
          setFlow(structuredClone(flow));
        }}
        disabled={flow.actions.length >= 10}
      >
        Add Action
      </Button>
    </div>
  );
};

export const actionTypeToVerbName: Record<FlowActionType, string> = {
  0: "Do nothing",
  1: "Wait for X seconds",
  2: "Check",
  3: "Add role",
  4: "Remove role",
  5: "Toggle role",
  6: "Send message",
  7: "Send webhook message",
  8: "Create thread",
  9: "Set variable",
  10: "Delete message",
};

const getActionText = (action: FlowAction) => {
  const prefix = actionTypeToVerbName[action.type];
  if (!prefix) return undefined;

  switch (action.type) {
    case 1:
      return `Wait for ${action.seconds} seconds`;
    case 8:
      if (action.name) {
        return `${prefix} named "${action.name}"`;
      }
      break;
    case 9:
      if (action.name) {
        return `${prefix} ${action.name}`;
      }
      break;
    default:
      break;
  }
  return prefix;
};

// FlowActionType[action.type].replace(/([A-Z])/g, (x) => ` ${x}`).trim();

const threadTypeOptions = [
  {
    label: "Public Thread",
    value: ChannelType.PublicThread,
  },
  {
    label: "Private Thread",
    value: ChannelType.PublicThread,
  },
  {
    label: "Announcement Thread",
    value: ChannelType.AnnouncementThread,
  },
];

const threadAutoArchiveOptions: {
  label: string;
  value: FlowActionCreateThread["autoArchiveDuration"];
}[] = [
  {
    label: "1 hour",
    value: 60,
  },
  {
    label: "1 day",
    value: 1440,
  },
  {
    label: "3 days",
    value: 4320,
  },
  {
    label: "1 week",
    value: 10080,
  },
];

const varTypeOptions: {
  label: string;
  value: FlowActionSetVariableType;
}[] = [
  {
    label: "Static",
    value: 0,
  },
  {
    label: "Adaptive",
    value: 1,
  },
];

export const FlowActionEditor: React.FC<{
  flow: FlowWithPartials;
  action: FlowAction;
  actionIndex: number;
  update: () => void;
  open?: boolean;
}> = ({ flow, action, actionIndex: i, update, open }) => {
  const { t } = useTranslation();

  const localIndexMax = 9;
  const previewText = getActionText(action);
  const errors = []; // getActionErrors(embed);

  return (
    <details
      className="group/flow-action"
      open={open ?? (action.type === 0 && i === 0)}
    >
      <summary className="group-open/flow-action:mb-2 py-1 px-1 transition-[margin] marker:content-none marker-none flex text-sm font-semibold cursor-default select-none">
        <CoolIcon
          icon="Chevron_Right"
          className="group-open/flow-action:rotate-90 mr-2 my-auto transition-transform"
        />
        {errors.length > 0 && (
          <CoolIcon
            icon="Circle_Warning"
            className="my-auto text-rose-600 dark:text-rose-400 mr-1.5"
          />
        )}
        <span className="shrink-0">Action {i + 1}</span>
        {previewText ? (
          <span className="truncate ml-1">- {previewText}</span>
        ) : (
          ""
        )}
        <div className="ml-auto text-base space-x-2.5 my-auto shrink-0">
          <button
            type="button"
            className={i === 0 ? "hidden" : ""}
            onClick={() => {
              flow.actions.splice(i, 1);
              flow.actions.splice(i - 1, 0, action);
              update();
            }}
          >
            <CoolIcon icon="Chevron_Up" />
          </button>
          <button
            type="button"
            className={i === flow.actions.length - 1 ? "hidden" : ""}
            onClick={() => {
              flow.actions.splice(i, 1);
              flow.actions.splice(i + 1, 0, action);
              update();
            }}
          >
            <CoolIcon icon="Chevron_Down" />
          </button>
          <button
            type="button"
            className={flow.actions.length - 1 >= localIndexMax ? "hidden" : ""}
            onClick={() => {
              flow.actions.splice(i + 1, 0, structuredClone(action));
              update();
            }}
          >
            <CoolIcon icon="Copy" />
          </button>
          <button
            type="button"
            onClick={() => {
              flow.actions.splice(i, 1);
              update();
            }}
          >
            <CoolIcon icon="Trash_Full" />
          </button>
        </div>
      </summary>
      <div className="-mt-2">
        {errors.length > 0 && (
          <div className="-mt-1 mb-1">
            <InfoBox severity="red" icon="Circle_Warning">
              {/* {errors.map((k) => t(k)).join("\n")} */}
            </InfoBox>
          </div>
        )}
        <div>
          {action.type === 0 ? (
            <StringSelect
              name="type"
              label="Action Type"
              options={Object.entries(actionTypeToVerbName)
                .filter(([v]) => v !== "2")
                .map(([value, label]) => ({ label, value }))}
              defaultValue={{
                label: actionTypeToVerbName[0],
                value: "0",
              }}
              onChange={(opt) => {
                const v = Number((opt as { value: string }).value);
                flow.actions.splice(i, 1, {
                  type: v,
                  ...(v === 1
                    ? {
                        seconds: 1,
                      }
                    : {}),
                });
                update();
              }}
            />
          ) : action.type === 1 ? (
            <TextInput
              label="Seconds"
              type="number"
              defaultValue={1}
              min={1}
              max={60}
              className="w-full"
              value={action.seconds}
              onChange={(e) => {
                // action.seconds = Math.max(
                //   Math.min(Number(e.currentTarget.value), 1),
                //   60,
                // );
                action.seconds = Number(e.currentTarget.value);
                update();
              }}
            />
          ) : action.type === 3 || action.type === 4 || action.type === 5 ? (
            <>
              <StringSelect name="roleId" label="Role" options={[]} />
              {/* <TextArea label="Reason" maxLength={512} className="w-full" /> */}
            </>
          ) : action.type === 6 ? (
            <>
              <StringSelect name="backupId" label="Backup" options={[]} />
              <StringSelect
                name="backupMessageIndex"
                label="Message"
                options={[]}
              />
              {/* <MessageFlagSelect /> */}
            </>
          ) : action.type === 7 ? (
            <>
              <StringSelect name="webhookId" label="Webhook" options={[]} />
              <StringSelect name="backupId" label="Backup" options={[]} />
              <StringSelect
                name="backupMessageIndex"
                label="Message"
                options={[]}
              />
              {/* <MessageFlagSelect /> */}
            </>
          ) : action.type === 8 ? (
            <>
              <StringSelect name="channelId" label="Channel" options={[]} />
              <TextInput
                name="name"
                label="Name"
                className="w-full"
                value={action.name}
                maxLength={100}
                onChange={(e) => {
                  action.name = e.currentTarget.value;
                  update();
                }}
              />
              <StringSelect
                name="threadType"
                label="Type"
                options={threadTypeOptions}
                value={threadTypeOptions.find(
                  (o) => o.value === action.threadType,
                )}
                onChange={(opt) => {
                  action.threadType = opt
                    ? (opt as { value: (typeof action)["threadType"] }).value
                    : undefined;
                  update();
                }}
              />
              <StringSelect
                name="autoArchiveDuration"
                label="Auto Archive Duration"
                options={threadAutoArchiveOptions}
                value={threadAutoArchiveOptions.find(
                  (o) => o.value === action.autoArchiveDuration,
                )}
                onChange={(opt) => {
                  action.autoArchiveDuration = opt
                    ? (opt as { value: (typeof action)["autoArchiveDuration"] })
                        .value
                    : undefined;
                  update();
                }}
              />
              <StringSelect name="appliedTags" label="Tags" options={[]} />
              {/* <StringSelect name="backupId" label="Backup" options={[]} />
              <StringSelect
                name="backupMessageIndex"
                label="Message"
                options={[]}
              /> */}
              {/* <MessageFlagSelect /> */}
            </>
          ) : action.type === 9 ? (
            <>
              <StringSelect
                name="varType"
                label="Type"
                options={varTypeOptions}
                defaultValue={varTypeOptions.find((o) => o.value === 0)}
                value={varTypeOptions.find((o) => o.value === action.varType)}
                onChange={(opt) => {
                  action.varType = opt
                    ? (opt as { value: FlowActionSetVariableType }).value
                    : undefined;
                  update();
                }}
              />
              <TextInput
                name="name"
                label="Name"
                className="w-full"
                maxLength={100}
                value={action.name}
                onChange={(e) => {
                  action.name = e.currentTarget.value;
                  update();
                }}
              />
              <TextInput
                name="value"
                label="Value"
                className="w-full"
                maxLength={500}
                value={String(action.value ?? "")}
                onChange={({ currentTarget }) => {
                  const v = currentTarget.value;
                  if (["true", "false"].includes(v)) {
                    action.value = v === "true";
                  } else {
                    action.value = currentTarget.value;
                  }
                  update();
                }}
              />
            </>
          ) : action.type === 10 ? (
            <>
              <p>
                A message with the ID of <code>messageId</code> will be deleted.
              </p>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </details>
  );
};

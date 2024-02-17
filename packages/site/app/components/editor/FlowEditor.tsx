import { Trans, useTranslation } from "react-i18next";
import { Flow, FlowAction, FlowActionType } from "~/store.server";
import { Button } from "../Button";
import { CoolIcon } from "../CoolIcon";
import { InfoBox } from "../InfoBox";
import { StringSelect } from "../StringSelect";
import { TextInput } from "../TextInput";

type FlowWithPartials = Flow & {
  actions: (Partial<FlowAction> & Pick<FlowAction, "type">)[];
};

export const FlowEditor: React.FC<{
  flow: Flow;
  setFlow: React.Dispatch<React.SetStateAction<Flow>>;
}> = ({ flow, setFlow }) => {
  return (
    <details className="group/flow mt-4 pb-2" open>
      <summary className="group-open/flow:mb-2 transition-[margin] marker:content-none marker-none flex font-semibold text-base cursor-default select-none">
        <CoolIcon
          icon="Chevron_Right"
          className="group-open/flow:rotate-90 mr-2 my-auto transition-transform"
        />
        <span className="shrink-0">Flow</span>
        {flow.name.trim() && (
          <span className="truncate ml-1">- {flow.name.trim()}</span>
        )}
      </summary>
      <div className="dark:px-3 dark:-mx-1 space-y-2">
        <TextInput
          label="Name"
          className="w-full h-40"
          value={flow.name}
          maxLength={100}
          required
          onInput={(e) => {
            setFlow({ ...flow, name: e.currentTarget.value });
          }}
        />
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
          className=""
          onClick={() => {
            flow.actions.push({ type: 0 });
            setFlow(structuredClone(flow));
          }}
          disabled={flow.actions.length >= 10}
        >
          Add Action
        </Button>
      </div>
    </details>
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
      <summary className="group-open/flow-action:mb-2 py-1 px-1 transition-[margin] marker:content-none marker-none flex text-lg font-semibold cursor-default select-none">
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
        <div className="ml-auto text-xl space-x-2.5 my-auto shrink-0">
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
        ) : action.type === 3 ? (
          <>
            <StringSelect
              name="roleId"
              label="Role"
              options={[]}
              defaultValue={null}
            />
            {/* <TextArea label="Reason" maxLength={1000} className="w-full" /> */}
          </>
        ) : (
          <></>
        )}
      </div>
    </details>
  );
};

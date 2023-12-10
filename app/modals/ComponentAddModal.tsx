import {
  APIActionRowComponent,
  APIButtonComponent,
  APIButtonComponentWithCustomId,
  APIButtonComponentWithURL,
  APIMessageActionRowComponent,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { useEffect, useReducer } from "react";
import { Button } from "~/components/Button";
import { StringSelect } from "~/components/StringSelect";
import { TextInput } from "~/components/TextInput";
import { PreviewButton } from "~/components/preview/Components";
import { QueryData } from "~/types/QueryData";
import { Modal, ModalProps } from "./Modal";

export interface ComponentAddModalData {
  message: QueryData["messages"][number];
  messageIndex: number;
  row: APIActionRowComponent<APIMessageActionRowComponent>;
  rowIndex: number;
  component?: APIMessageActionRowComponent;
  componentIndex?: number;
}

interface FlowState {
  stepTitle: string;
  steps: string[];
  draftComponentType?: string;
  component?: APIMessageActionRowComponent;
}

const styleToColor = {
  [ButtonStyle.Primary]: "blurple",
  [ButtonStyle.Secondary]: "gray",
  [ButtonStyle.Success]: "green",
  [ButtonStyle.Danger]: "red",
};

export const ComponentAddModal = (
  props: ModalProps &
    Partial<ComponentAddModalData> & {
      data: QueryData;
      setData: React.Dispatch<React.SetStateAction<QueryData>>;
    }
) => {
  const { component, componentIndex, row, rowIndex, message, messageIndex, data, setData } =
    props;

  const [flowState, updateFlowState] = useReducer(
    (d: FlowState, partialD: Partial<FlowState>) => ({ ...d, ...partialD }),
    {
      stepTitle: `${component ? "Edit" : "Add"} Component`,
      steps: [],
      component,
    }
  );

  useEffect(() => {
    if (!props.open) {
      updateFlowState({
        stepTitle: "Edit Component",
        steps: [],
        draftComponentType: undefined,
        component,
      });
    } else {
      updateFlowState({
        component,
      });
    }
  }, [props.open]);

  return (
    <Modal title={flowState.stepTitle} {...props}>
      {flowState.component ? (
        <div>
          {flowState.component.type === ComponentType.Button ? (
            <div className="space-y-2">
              <TextInput
                label="Label"
                className="w-full"
                maxLength={80}
                defaultValue={flowState.component.label}
                onInput={(e) =>
                  updateFlowState({
                    component: {
                      ...flowState.component,
                      label: e.currentTarget.value,
                    } as APIButtonComponent,
                  })
                }
              />
              <TextInput
                // Later: use emoji picker here
                label="Emoji"
                className="w-full"
                defaultValue={
                  flowState.component.emoji?.id ??
                  flowState.component.emoji?.name
                }
              />
              {flowState.component.style === ButtonStyle.Link ? (
                <TextInput
                  label="URL"
                  type="url"
                  className="w-full"
                  defaultValue={flowState.component.url}
                  onInput={(e) =>
                    updateFlowState({
                      component: {
                        ...flowState.component,
                        url: e.currentTarget.value,
                      } as APIButtonComponentWithURL,
                    })
                  }
                />
              ) : (
                <div>
                  <p className="text-sm font-medium cursor-default">
                    Style (
                    {flowState.component.style
                      ? `currently ${styleToColor[flowState.component.style]}`
                      : "click to select one"}
                    )
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {[
                      ButtonStyle.Primary,
                      ButtonStyle.Secondary,
                      ButtonStyle.Success,
                      ButtonStyle.Danger,
                    ].map((style) => (
                      <PreviewButton
                        data={
                          {
                            ...flowState.component,
                            style,
                          } as APIButtonComponentWithCustomId
                        }
                        onClick={() =>
                          updateFlowState({
                            component: {
                              ...flowState.component,
                              style,
                            } as APIButtonComponent,
                          })
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <></>
          )}
          <div className="flex w-full mt-4">
            <Button
              onClick={() => {
                row!.components.splice(componentIndex ?? row!.components.length, 1, flowState.component!);
                setData({ ...data });
                props.setOpen(false);
              }}
              className="mx-auto"
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <StringSelect
            name="component-type"
            placeholder="Select a component type"
            options={[
              { value: "button", label: "Button" },
              { value: "link-button", label: "Link Button" },
              { value: "string-select", label: "String Select Menu" },
              { value: "user-select", label: "User Select Menu" },
              { value: "role-select", label: "Role Select Menu" },
              { value: "mentionable-select", label: "User & Role Select Menu" },
              { value: "channel-select", label: "Channel Select Menu" },
            ]}
            onChange={(option: any) => {
              updateFlowState({ draftComponentType: option.value });
            }}
            required
          />
          <p className="mt-2">
            The type of component determines not only its appearance, but also
            the actions that it's able to perform. Most notably is that a link
            button can only direct a user to a URL in their browser, and can
            carry out no other actions.
          </p>
          <div className="flex w-full mt-4">
            <Button
              disabled={!flowState.draftComponentType}
              onClick={() => {
                let draft: FlowState["component"];
                switch (flowState.draftComponentType) {
                  case "button":
                    draft = {
                      type: ComponentType.Button,
                      style: ButtonStyle.Primary,
                      custom_id: "",
                    };
                    break;
                  case "link-button":
                    draft = {
                      type: ComponentType.Button,
                      style: ButtonStyle.Link,
                      url: "",
                    };
                    break;
                  case "string-select":
                    draft = {
                      type: ComponentType.StringSelect,
                      custom_id: "",
                      options: [],
                    };
                    break;
                  case "user-select":
                    draft = { type: ComponentType.UserSelect, custom_id: "" };
                    break;
                  case "role-select":
                    draft = { type: ComponentType.RoleSelect, custom_id: "" };
                    break;
                  case "mentionable-select":
                    draft = {
                      type: ComponentType.MentionableSelect,
                      custom_id: "",
                    };
                    break;
                  case "channel-select":
                    draft = {
                      type: ComponentType.ChannelSelect,
                      custom_id: "",
                    };
                    break;
                  default:
                    break;
                }

                updateFlowState({
                  stepTitle: "Customize Component",
                  steps: [
                    `Choose type (${flowState.draftComponentType!.replace(
                      /-/g,
                      ""
                    )})`,
                  ],
                  component: draft,
                });
              }}
              className="mx-auto"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

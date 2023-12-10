import {
  APIActionRowComponent,
  APIButtonComponent,
  APIChannelSelectComponent,
  APIMentionableSelectComponent,
  APIMessageActionRowComponent,
  APIMessageComponent,
  APIRoleSelectComponent,
  APIStringSelectComponent,
  APITextInputComponent,
  APIUserSelectComponent,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import LocalizedStrings from "react-localization";
import { ComponentAddModalData } from "~/modals/ComponentAddModal";
import { QueryData } from "~/types/QueryData";
import { Button } from "../Button";
import { CoolIcon } from "../CoolIcon";
import { PreviewSelect } from "../preview/Components";

export const getComponentText = (
  component: APIMessageComponent
): string | undefined =>
  component.type === ComponentType.Button
    ? component.label ?? component.emoji?.name
    : component.type === ComponentType.StringSelect
    ? component.placeholder
    : undefined;

export const getComponentWidth = (component: {
  type: ComponentType;
}): number => {
  switch (component.type) {
    case ComponentType.Button:
      return 1;
    case ComponentType.StringSelect:
    case ComponentType.UserSelect:
    case ComponentType.RoleSelect:
    case ComponentType.MentionableSelect:
    case ComponentType.ChannelSelect:
    case ComponentType.TextInput:
      return 5;
    default:
      break;
  }
  return 0;
};

export const getRowWidth = (
  row: APIActionRowComponent<
    | APIButtonComponent
    | APIStringSelectComponent
    | APIUserSelectComponent
    | APIRoleSelectComponent
    | APIMentionableSelectComponent
    | APIChannelSelectComponent
    | APITextInputComponent
  >
): number => {
  return row.components.reduce(
    (last, component) => getComponentWidth(component) + last,
    0
  );
};

const strings = new LocalizedStrings({
  en: {
    rowEmpty: "Must contain at least one component (button/select)",
    labelEmpty: "Must have a label or emoji, or both",
    urlEmpty: "Link button must have a URL",
    optionsEmpty: "Must contain at least one select option",
  },
});

export const getComponentErrors = (
  component: APIMessageComponent
): string[] => {
  let errors: string[] = [];
  switch (component.type) {
    case ComponentType.ActionRow:
      if (component.components.length === 0) {
        errors.push(strings.rowEmpty);
      }
      // if (component.components.length > 5) {
      //   errors.push("Cannot contain more than five components")
      // }
      break;
    case ComponentType.Button:
      if (!component.emoji && !component.label) {
        errors.push(strings.labelEmpty);
      }
      if (component.style === ButtonStyle.Link && !component.url) {
        errors.push(strings.urlEmpty);
      }
      break;
    case ComponentType.StringSelect:
      if (component.options.length === 0) {
        errors.push(strings.optionsEmpty);
      }
    default:
      break;
  }
  return errors;
};

export const ActionRowEditor: React.FC<{
  message: QueryData["messages"][number];
  messageIndex: number;
  row: APIActionRowComponent<APIMessageActionRowComponent>;
  rowIndex: number;
  data: QueryData;
  setData: React.Dispatch<React.SetStateAction<QueryData>>;
  open?: boolean;
  setAddingComponentData: React.Dispatch<
    React.SetStateAction<ComponentAddModalData | undefined>
  >;
}> = ({
  message,
  messageIndex: mi,
  row,
  rowIndex: i,
  data,
  setData,
  open,
  setAddingComponentData,
}) => {
  // const previewText = undefined; // getComponentText(row);
  const errors = getComponentErrors(row);
  return (
    <details className="group/action-row" open={open}>
      <summary className="group-open/action-row:mb-2 transition-[margin] marker:content-none marker-none flex text-base text-gray-600 dark:text-gray-400 font-semibold cursor-default select-none">
        <CoolIcon
          icon="Chevron_Right"
          className="group-open/action-row:rotate-90 mr-2 my-auto transition-transform"
        />
        Row {i + 1}
        <div className="ml-auto text-xl space-x-2.5 my-auto shrink-0">
          <button
            className={getRowWidth(row) === 5 ? "hidden" : ""}
            onClick={() =>
              setAddingComponentData({
                row,
                rowIndex: i,
                message,
                messageIndex: mi,
              })
            }
          >
            <CoolIcon icon="Add_Plus_Square" />
          </button>
          <button
            className={i === 0 ? "hidden" : ""}
            onClick={() => {
              message.data.components!.splice(i, 1);
              message.data.components!.splice(i - 1, 0, row);
              setData({ ...data });
            }}
          >
            <CoolIcon icon="Chevron_Up" />
          </button>
          <button
            className={
              i === message.data.components!.length - 1 ? "hidden" : ""
            }
            onClick={() => {
              message.data.components!.splice(i, 1);
              message.data.components!.splice(i + 1, 0, row);
              setData({ ...data });
            }}
          >
            <CoolIcon icon="Chevron_Down" />
          </button>
          <button
            className={
              message.data.components!.length - 1 + 1 >= 5 ? "hidden" : ""
            }
            onClick={() => {
              message.data.components!.splice(i + 1, 0, row);
              setData({ ...data });
            }}
          >
            <CoolIcon icon="Copy" />
          </button>
          <button
            onClick={() => {
              message.data.components!.splice(i, 1);
              setData({ ...data });
            }}
          >
            <CoolIcon icon="Trash_Full" />
          </button>
        </div>
      </summary>
      {errors.length > 0 && (
        <p className="-mt-1 mb-1 text-sm font-regular p-2 rounded bg-rose-300 border-2 border-rose-400 dark:border-rose-300 dark:text-black select-none">
          {errors.map((e) => (
            <span className="block" key={`row-error-${e}`}>
              <CoolIcon icon="Circle_Warning" /> {e}
            </span>
          ))}
        </p>
      )}
      <div className="flex flex-wrap gap-1">
        {row.components.map((component, ci) => {
          const onClick = () =>
            setAddingComponentData({
              component,
              componentIndex: ci,
              row,
              rowIndex: i,
              message,
              messageIndex: mi,
            });
          switch (component.type) {
            case ComponentType.Button:
              return (
                <Button
                  discordstyle={component.style}
                  className="!text-sm"
                  onClick={onClick}
                >
                  {component.label}
                </Button>
              );
            case ComponentType.StringSelect:
            case ComponentType.UserSelect:
            case ComponentType.RoleSelect:
            case ComponentType.MentionableSelect:
            case ComponentType.ChannelSelect:
              return <PreviewSelect data={component} onClick={onClick} />;
            default:
              break;
          }
          return <></>;
        })}
      </div>
    </details>
  );
};

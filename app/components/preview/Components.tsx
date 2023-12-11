import {
  APIButtonComponent,
  APIMessage,
  APIMessageActionRowComponent,
  APISelectMenuComponent,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { Button } from "../Button";
import { CoolIcon } from "../CoolIcon";
import { selectStrings } from "../StringSelect";

type PreviewComponent<T extends APIMessageActionRowComponent> = React.FC<{
  data: T;
  onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
}>;

export const PreviewButton: PreviewComponent<APIButtonComponent> = ({
  data,
  onClick,
}) => {
  const button = (
    <Button discordstyle={data.style} emoji={data.emoji} className="!text-sm" onClick={onClick}>
      {data.label}
    </Button>
  );
  return data.style === ButtonStyle.Link ? (
    <a href={data.url} target="_blank">
      {button}
    </a>
  ) : (
    button
  );
};

export const PreviewSelect: PreviewComponent<APISelectMenuComponent> = ({
  data,
  onClick,
}) => {
  return (
    <button
      data-custom-id={data.custom_id}
      data-type={data.type}
      className="rounded p-2 text-left bg-[#ebebeb] dark:bg-[#1e1f22] border border-black/[0.08] dark:border-transparent hover:border-[#c4c9ce] dark:hover:border-[#020202] w-[90%] max-w-[400px] mr-4 transition-[border] duration-200 font-medium cursor-pointer grid grid-cols-[1fr_auto] items-center"
      onClick={onClick}
    >
      <span className="truncate text-[#5c5e66] dark:text-[#949ba4] leading-none">
        {data.placeholder ?? selectStrings.defaultPlaceholder}
      </span>
      <div className="flex items-center gap-1">
        <CoolIcon icon="Chevron_Down" className="" />
      </div>
    </button>
  );
};

const previewComponentMap = {
  [ComponentType.Button]: PreviewButton,
  [ComponentType.StringSelect]: PreviewSelect,
  [ComponentType.UserSelect]: PreviewSelect,
  [ComponentType.RoleSelect]: PreviewSelect,
  [ComponentType.MentionableSelect]: PreviewSelect,
  [ComponentType.ChannelSelect]: PreviewSelect,
};

export const MessageComponents: React.FC<{
  components: NonNullable<APIMessage["components"]>;
}> = ({ components }) => {
  return (
    <div className="grid gap-1 py-[0.125rem]">
      {components.map((row, i) => (
        <div key={`action-row-${i}`} className="flex flex-wrap gap-1">
          {row.components.map((component, ci) => {
            const fc = previewComponentMap[component.type];
            if (fc) {
              return (
                <div
                  key={`action-row-${i}-component-${ci}`}
                  className="contents"
                >
                  {
                    // @ts-ignore
                    fc({ data: component })
                  }
                </div>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};

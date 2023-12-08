import {
  APIButtonComponent,
  APIMessage,
  APIMessageActionRowComponent,
  APISelectMenuComponent,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import LocalizedStrings from "react-localization";
import { Button } from "../Button";
import { CoolIcon } from "../CoolIcon";

type PreviewComponent<T extends APIMessageActionRowComponent> = React.FC<{
  data: T;
}>;

export const PreviewButton: PreviewComponent<APIButtonComponent> = ({
  data,
}) => {
  const button = (
    <Button discordstyle={data.style} className="!text-sm">
      {data.label}
    </Button>
  );
  return data.style === ButtonStyle.Link ? (
    <a href={data.url} target="_blank">{button}</a>
  ) : (
    button
  );
};

const strings = new LocalizedStrings({
  en: {
    defaultPlaceholder: "Make a selection",
  },
  de: {
    defaultPlaceholder: "Triff eine Auswahl",
  },
  fr: {
    defaultPlaceholder: "Fais un choix",
  },
  it: {
    defaultPlaceholder: "Seleziona",
  },
  es: {
    defaultPlaceholder: "Haz una selección",
  },
  se: {
    defaultPlaceholder: "Gör ett val",
  },
  ne: {
    defaultPlaceholder: "Maak een selectie",
  },
});

export const PreviewSelect: PreviewComponent<APISelectMenuComponent> = ({
  data,
}) => {
  return (
    <div
      data-custom-id={data.custom_id}
      data-type={data.type}
      className="rounded p-2 bg-[#ebebeb] dark:bg-[#1e1f22] border border-black/[0.08] dark:border-transparent hover:border-[#c4c9ce] dark:hover:border-[#020202] w-[90%] min-w- max-w-[400px] mr-4 transition-[border] duration-200 font-medium cursor-pointer grid grid-cols-[1fr_auto] items-center"
    >
      <span className="truncate text-[#5c5e66] dark:text-[#949ba4] leading-none">
        {data.placeholder ?? strings.defaultPlaceholder}
      </span>
      <div className="flex items-center gap-1">
        <CoolIcon icon="Chevron_Down" className="" />
      </div>
    </div>
  );
};

const componentMap = {
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
            const fc = componentMap[component.type];
            if (fc) {
              return (
                <div key={`action-row-${i}-component-${ci}`} className="contents">
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

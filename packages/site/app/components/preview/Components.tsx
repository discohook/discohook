import {
  APIButtonComponent,
  APIMessage,
  APIMessageActionRowComponent,
  APISelectMenuComponent,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import { cdn } from "~/util/discord";
import { Button } from "../Button";
import { CoolIcon } from "../icons/CoolIcon";
import { AuthorType } from "./Message";

type PreviewComponent<T extends APIMessageActionRowComponent> = React.FC<{
  data: T;
  onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  authorType?: AuthorType;
}>;

export const PreviewButton: PreviewComponent<APIButtonComponent> = ({
  data,
  onClick,
  authorType,
}) => {
  const nonSendable =
    authorType &&
    ((data.style === ButtonStyle.Link &&
      authorType < AuthorType.ApplicationWebhook) ||
      authorType < AuthorType.ActionableWebhook);

  const button = (
    <Button
      discordstyle={data.style}
      emoji={data.emoji}
      disabled={data.disabled ?? false}
      className={`!text-sm ${nonSendable ? "hidden" : ""}`}
      onClick={onClick}
    >
      {data.label}
    </Button>
  );
  return data.style === ButtonStyle.Link ? (
    <a href={data.url} target="_blank" rel="noreferrer">
      {button}
    </a>
  ) : (
    button
  );
};

export const PreviewSelect: PreviewComponent<APISelectMenuComponent> = ({
  data,
  onClick,
  authorType,
}) => {
  const { t } = useTranslation();
  const shouldLeftPad =
    "options" in data && data.options.filter((o) => o.emoji).length !== 0;
  const nonSendable = authorType && authorType < AuthorType.ActionableWebhook;

  return (
    <div className="w-[90%] max-w-[400px] mr-4 relative">
      <button
        type="button"
        data-custom-id={data.custom_id}
        data-type={data.type}
        data-open={false}
        className={`peer/select group/select rounded data-[open=true]:rounded-b-none p-2 text-left bg-[#ebebeb] dark:bg-[#1e1f22] border border-black/[0.08] dark:border-transparent hover:border-[#c4c9ce] dark:hover:border-[#020202] transition-[border,_opacity] duration-200 font-medium cursor-pointer grid grid-cols-[1fr_auto] items-center w-full disabled:opacity-60 disabled:cursor-not-allowed ${
          nonSendable ? "hidden" : ""
        }`}
        disabled={data.disabled}
        onClick={(e) => {
          e.currentTarget.dataset.open = String(
            e.currentTarget.dataset.open === "false",
          );
          if (onClick) onClick(e);
        }}
      >
        <span className="truncate text-[#5c5e66] dark:text-[#949ba4] leading-none">
          {data.placeholder ?? t("defaultPlaceholder")}
        </span>
        <div className="flex items-center gap-1">
          <CoolIcon
            icon="Chevron_Down"
            className="group-data-[open=true]/select:rotate-180"
          />
        </div>
      </button>
      {data.type === ComponentType.StringSelect && (
        <div className="hidden peer-data-[open=true]/select:block absolute left-0 w-full bg-[#f2f3f5] dark:bg-[#2b2d31] rounded-b border border-[#e3e5e8] dark:border-[#1e1f22] overflow-y-auto max-h-64">
          {data.options.map((option, oi) => (
            <div
              key={`preview-select-option-${oi}-${option.value}`}
              className="flex last:rounded-b hover:bg-[#e0e1e5] hover:dark:bg-[#36373d] w-full p-2 cursor-pointer"
            >
              {option.emoji?.id ? (
                <img
                  src={cdn.emoji(option.emoji.id)}
                  className="w-[22px] h-[22px] mr-2 my-auto shrink-0"
                  alt={option.emoji.name}
                />
              ) : (
                shouldLeftPad && <div className="w-[22px] mr-2 shrink-0" />
              )}
              <div className="truncate text-sm font-medium my-auto">
                <p className="truncate leading-[18px]">{option.label}</p>
                {option.description && (
                  <p className="truncate text-[#4e5058] dark:text-[#b5bac1] leading-[18px]">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
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
  authorType?: AuthorType;
}> = ({ components, authorType }) => {
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
                    fc({ data: component, authorType })
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

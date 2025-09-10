import {
  type APIContainerComponent,
  type APISectionAccessoryComponent,
  type APITextDisplayComponent,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import type { APIButtonComponent, QueryData } from "~/types/QueryData";
import type { CacheManager } from "~/util/cache/CacheManager";
import { MAX_TOTAL_COMPONENTS_CHARACTERS } from "~/util/constants";
import { ButtonSelect } from "../ButtonSelect";
import { useError } from "../Error";
import { TextArea } from "../TextArea";
import { submitComponent } from "./ComponentEditor";
import { TopLevelComponentEditorContainer } from "./TopLevelComponentEditor";

export const TextDisplayEditor: React.FC<{
  message: QueryData["messages"][number];
  component: APITextDisplayComponent;
  parent: APIContainerComponent | undefined;
  index: number;
  data: QueryData;
  setData: React.Dispatch<QueryData>;
  cache?: CacheManager;
  open?: boolean;
}> = ({ message, component, parent, index: i, data, setData, cache, open }) => {
  const { t } = useTranslation();
  const [error, setError] = useError(t);

  return (
    <TopLevelComponentEditorContainer
      t={t}
      message={message}
      component={component}
      parent={parent}
      index={i}
      data={data}
      setData={setData}
      open={open}
    >
      {error}
      <div className="space-y-2">
        <div>
          <TextArea
            label={t("content")}
            className="w-full"
            maxLength={MAX_TOTAL_COMPONENTS_CHARACTERS}
            required
            value={component.content}
            markdown="full"
            cache={cache}
            onChange={({ currentTarget }) => {
              component.content = currentTarget.value;
              setData({ ...data });
            }}
          />
        </div>
        <div>
          <p className="text-sm font-medium cursor-default">{t("accessory")}</p>
          <ButtonSelect<"button" | "linkButton" | "thumbnail">
            options={[
              { label: t("component.2"), icon: "Mouse", value: "button" },
              {
                label: t("linkButton"),
                icon: "External_Link",
                value: "linkButton",
              },
              {
                label: t("component.11"),
                icon: "Image_01",
                value: "thumbnail",
              },
            ]}
            onValueChange={async (value) => {
              const parentChildren =
                parent?.components ?? message.data.components;
              if (!parentChildren) {
                console.log(
                  "Could not resolve sibling container to splice into",
                );
                return;
              }
              let accessory: APISectionAccessoryComponent | undefined;
              switch (value) {
                case "button":
                  accessory = {
                    type: ComponentType.Button,
                    style: ButtonStyle.Primary,
                    custom_id: "",
                  };
                  break;
                case "linkButton":
                  accessory = {
                    type: ComponentType.Button,
                    style: ButtonStyle.Link,
                    url: "https://discohook.app",
                  };
                  break;
                case "thumbnail":
                  accessory = {
                    type: ComponentType.Thumbnail,
                    media: { url: "" },
                  };
                  break;
                default:
                  break;
              }

              const setAccessory = (
                accessory: APISectionAccessoryComponent & { _state?: string },
              ) => {
                parentChildren.splice(i, 1, {
                  type: ComponentType.Section,
                  components: [component],
                  accessory,
                });
                setData({ ...data });
              };

              if (accessory) {
                if (accessory.type === ComponentType.Button) {
                  // loading indicator
                  setAccessory({ ...accessory, _state: "submitting" });

                  const accessoryComponent = (await submitComponent(
                    accessory,
                    setError,
                  )) as APIButtonComponent | undefined;
                  if (accessoryComponent) {
                    // setError callback should reasonably handle else state
                    setAccessory(accessoryComponent);
                  }
                } else {
                  setAccessory(accessory);
                }
              }
            }}
          >
            {t("addAccessory")}
          </ButtonSelect>
        </div>
      </div>
    </TopLevelComponentEditorContainer>
  );
};

import { isLinkButton } from "discord-api-types/utils/v10";
import {
  type APIActionRowComponent,
  ButtonStyle,
  ComponentType,
} from "discord-api-types/v10";
import { useTranslation } from "react-i18next";
import { twJoin } from "tailwind-merge";
import { type ApiRoute, apiUrl, BRoutes } from "~/api/routing";
import type { action as ApiPostComponents } from "~/api/v1/components";
import type { ComponentFoundBackupHook } from "~/api/v1/components.$id.backups";
import { getComponentId } from "~/api/v1/log.webhooks.$webhookId.$webhookToken.messages.$messageId";
import type {
  APIAutoPopulatedSelectMenuComponent,
  APIButtonComponentWithCustomId,
  APIComponentInMessageActionRow,
  APIStringSelectComponent,
} from "~/types/QueryData";
import { MAX_ACTION_ROW_WIDTH } from "~/util/constants";
import { getZodErrorMessage, type SerializeFrom } from "~/util/loader";
import type { SetErrorFunction } from "../Error";
import { CoolIcon, type CoolIconsGlyph } from "../icons/CoolIcon";
import { getComponentText, getRowWidth } from "./TopLevelComponentEditor";

/**
 * This is a bit of a dance, we basically just want to generate a
 * server ID for these components so they can remain synced.
 * We use the returned data from the server just in case it wanted
 * to change something.
 * You can also do this while logged out.
 */
export const submitComponent = async (
  data: APIComponentInMessageActionRow,
  setError?: SetErrorFunction,
) => {
  const id = getComponentId(data)?.toString();

  const perform = (method: string, route: ApiRoute) =>
    fetch(apiUrl(route), {
      method,
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });

  let response = id
    ? await perform("PUT", BRoutes.component(id))
    : await perform("POST", BRoutes.components());
  if (
    id !== undefined &&
    (response.status === 404 || response.status === 403)
  ) {
    // We tried to PUT, but the component doesn't exist anymore or isn't owned
    // by the current account. Since the client already has the required data,
    // the least confusing thing to do is simply create the component again.
    response = await perform("POST", BRoutes.components());
  }
  if (!response.ok) {
    console.error(response.status, response.statusText);
    if (setError) {
      const data = await response.json();
      setError({ message: getZodErrorMessage(data) });
    }
    return;
  }
  const raw = (await response.json()) as SerializeFrom<
    typeof ApiPostComponents
  >;
  let component: APIComponentInMessageActionRow | undefined;
  switch (raw.data.type) {
    case ComponentType.Button: {
      component = {
        ...raw.data,
        custom_id: `p_${raw.id}`,
      };
      if (
        component.style !== ButtonStyle.Link &&
        component.style !== ButtonStyle.Premium
      ) {
        component.flow = structuredClone(
          data as APIButtonComponentWithCustomId,
        ).flow;
      }
      break;
    }
    case ComponentType.StringSelect: {
      const { minValues, maxValues, ...rest } = raw.data;
      component = {
        ...rest,
        flows: structuredClone(data as APIStringSelectComponent).flows,
        custom_id: `p_${raw.id}`,
        min_values: minValues,
        max_values: maxValues,
      };
      break;
    }
    case ComponentType.UserSelect:
    case ComponentType.RoleSelect:
    case ComponentType.MentionableSelect:
    case ComponentType.ChannelSelect: {
      const { minValues, maxValues, defaultValues, ...rest } = raw.data;
      component = {
        ...rest,
        flow: structuredClone(data as APIAutoPopulatedSelectMenuComponent).flow,
        custom_id: `p_${raw.id}`,
        min_values: minValues,
        max_values: maxValues,
        // @ts-expect-error
        default_values: defaultValues,
      };
      break;
    }
    default:
      break;
  }
  if (setError) setError(undefined);
  return component;
};

export const IndividualComponentEditor: React.FC<{
  component: APIComponentInMessageActionRow;
  index: number;
  row: APIActionRowComponent<APIComponentInMessageActionRow>;
  updateRow: (
    row?: APIActionRowComponent<APIComponentInMessageActionRow>,
  ) => void;
  onClick: () => void;
  actionsBar?: Partial<
    Record<"up" | "down" | "copy" | "delete", (() => void) | null>
  >;
  componentFoundBackupsHook: ComponentFoundBackupHook;
}> = ({
  component,
  index,
  row,
  updateRow,
  onClick,
  actionsBar,
  componentFoundBackupsHook,
}) => {
  const { t } = useTranslation();
  const previewText = getComponentText(component);

  // Don't allow an index change while the component is submitting
  // to avoid accidentally overwriting something
  const anySubmitting =
    row.components.filter((c) => "_state" in c && c._state === "submitting")
      .length !== 0;

  const componentId = getComponentId(component);
  const hasBackupWarning =
    componentId === undefined
      ? false
      : !!componentFoundBackupsHook[0][String(componentId)]?.length;

  return (
    <div className="flex text-base text-gray-600 dark:text-gray-400 rounded-lg bg-blurple/10 hover:bg-blurple/15 border border-blurple/30 shadow hover:shadow-lg transition font-semibold select-none">
      <button
        type="button"
        className="flex p-2 h-full w-full my-auto truncate disabled:animate-pulse"
        onClick={onClick}
        disabled={"_state" in component && component._state === "submitting"}
      >
        <div className="me-2 my-auto size-6 shrink-0">
          {component.type === ComponentType.Button ? (
            <div
              className={twJoin(
                "rounded text-gray-50",
                isLinkButton(component)
                  ? "p-[5px_5px_4px_4px]"
                  : "w-full h-full",
                {
                  [ButtonStyle.Primary]: "bg-blurple",
                  [ButtonStyle.Premium]: "bg-blurple",
                  [ButtonStyle.Secondary]: "bg-[#6d6f78] dark:bg-[#4e5058]",
                  [ButtonStyle.Link]: "bg-[#6d6f78] dark:bg-[#4e5058]",
                  [ButtonStyle.Success]: "bg-[#248046] dark:bg-[#248046]",
                  [ButtonStyle.Danger]: "bg-[#da373c]",
                }[component.style],
              )}
            >
              {isLinkButton(component) && (
                <CoolIcon icon="External_Link" className="block" />
              )}
            </div>
          ) : (
            <div className="rounded bg-[#6d6f78] dark:bg-[#4e5058] p-[5px_5px_4px_4px]">
              <CoolIcon
                icon={
                  (
                    {
                      [ComponentType.StringSelect]: "Chevron_Down",
                      [ComponentType.UserSelect]: "Users",
                      [ComponentType.RoleSelect]: "Tag",
                      [ComponentType.MentionableSelect]: "Mention",
                      [ComponentType.ChannelSelect]: "Chat",
                    } as Record<(typeof component)["type"], CoolIconsGlyph>
                  )[component.type]
                }
                className="block"
              />
            </div>
          )}
        </div>
        <p className="truncate my-auto">
          {previewText ||
            `${t(`component.${component.type}`)} ${
              component.type === 2 ? index + 1 : ""
            }`}
        </p>
      </button>
      <div className="ms-auto text-lg space-x-2.5 rtl:space-x-reverse my-auto shrink-0 p-2 pl-0">
        {hasBackupWarning ? (
          <CoolIcon
            icon="Triangle_Warning"
            className="text-yellow-600 dark:text-yellow-200"
          />
        ) : null}
        <button
          type="button"
          className={index === 0 || actionsBar?.up === null ? "hidden" : ""}
          disabled={anySubmitting}
          onClick={
            actionsBar?.up ??
            (() => {
              row.components.splice(index, 1);
              row.components.splice(index - 1, 0, component);
              updateRow(row);
            })
          }
        >
          <CoolIcon icon="Chevron_Up" />
        </button>
        <button
          type="button"
          className={
            index === row.components.length - 1 || actionsBar?.down === null
              ? "hidden"
              : ""
          }
          disabled={anySubmitting}
          onClick={
            actionsBar?.down ??
            (() => {
              row.components.splice(index, 1);
              row.components.splice(index + 1, 0, component);
              updateRow(row);
            })
          }
        >
          <CoolIcon icon="Chevron_Down" />
        </button>
        <button
          type="button"
          className={
            getRowWidth(row) >= MAX_ACTION_ROW_WIDTH ||
            actionsBar?.copy === null
              ? "hidden"
              : ""
          }
          disabled={anySubmitting}
          onClick={
            actionsBar?.copy ??
            (async () => {
              // Don't accidentally save the current component
              const { custom_id: _, ...withoutId } = component;
              const copied = await submitComponent({
                custom_id: "",
                ...withoutId,
              });
              if (copied) {
                // Should always be non-null
                row.components.splice(index + 1, 0, copied);
                updateRow(row);
              }
            })
          }
        >
          <CoolIcon icon="Copy" />
        </button>
        <button
          type="button"
          disabled={anySubmitting}
          className={actionsBar?.delete === null ? "hidden" : ""}
          onClick={
            actionsBar?.delete ??
            (() => {
              row.components.splice(index, 1);
              updateRow(row);

              // Not sure about this as of now. I think we should have a pop up
              // that asks the user if they want to delete the component (and/or
              // check placements to see if it exists elsewhere)
              // const pattern = /^p_(\d+)$/;
              // if (component.custom_id && pattern.test(component.custom_id)) {
              // const id = component.custom_id.match(pattern)![1];
              // fetch(apiUrl(BRoutes.component(id)), {
              //   method: "PATCH",
              //   body: JSON.stringify({ draft: true }),
              //   headers: { "Content-Type": "application/json" },
              // })
              //   .then((r) =>
              //     console.log(
              //       `${r.status} ${r.statusText} drafting component ${id}`,
              //     ),
              //   )
              //   .catch((e) =>
              //     console.error(`Error attempting to draft component ${id}`, e),
              //   );
              // fetch(apiUrl(BRoutes.component(id)), { method: "DELETE" })
              //   .then((r) =>
              //     console.log(
              //       `${r.status} ${r.statusText} deleting component ${id}`,
              //     ),
              //   )
              //   .catch((e) =>
              //     console.error(
              //       `Error attempting to delete component ${id}`,
              //       e,
              //     ),
              //   );
              // }
            })
          }
        >
          <CoolIcon icon="Trash_Full" />
        </button>
      </div>
    </div>
  );
};

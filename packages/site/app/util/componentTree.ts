import {
  type APIActionRowComponent,
  type APIComponentInModalActionRow,
  ComponentType,
} from "discord-api-types/v10";
import type {
  APIComponentInMessageActionRow,
  APIMessageTopLevelComponent,
} from "~/types/QueryData";
import { MAX_ACTION_ROW_WIDTH } from "~/util/constants";

/**
 * I think i touched on this more in bot/, but basically this is just a list of
 * indexes to point to a specific component which works with any given level of
 * nesting
 */
export type ComponentPath = readonly number[];

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
    APIComponentInMessageActionRow | APIComponentInModalActionRow
  >,
): number =>
  row.components.reduce(
    (last, component) => getComponentWidth(component) + last,
    0,
  );

interface ResolvedTopLevelPath {
  array: APIMessageTopLevelComponent[];
  index: number;
}

/** Finds siblings of a given path within its container/message */
export const resolveTopLevelPath = (
  root: APIMessageTopLevelComponent[],
  path: ComponentPath,
): ResolvedTopLevelPath | undefined => {
  if (path.length === 1) {
    return { array: root, index: path[0] };
  }
  if (path.length === 2) {
    const top = root[path[0]];
    if (!top || top.type !== ComponentType.Container) return undefined;
    return {
      array: top.components as unknown as APIMessageTopLevelComponent[],
      index: path[1],
    };
  }
  return undefined;
};

/**
 * Moves the component from `srcArray[srcIndex]` to `destArray[destIndex]`.
 * Returns the moved component, or undefined if nothing existed to be moved
 */
const spliceMove = <T>(
  srcArray: T[],
  srcIndex: number,
  destArray: T[],
  destIndex: number,
): T | undefined => {
  if (srcArray[srcIndex] === undefined) return undefined;
  const [moved] = srcArray.splice(srcIndex, 1);
  let adjustedDestIndex = destIndex;
  if (destArray === srcArray && adjustedDestIndex > srcIndex) {
    // decrement to account for offset created by splicing, since we're
    // inserting back into the same array
    adjustedDestIndex -= 1;
  }
  destArray.splice(adjustedDestIndex, 0, moved);
  return moved;
};

/**
 * Moves one top level component. Resolves both paths before moving anything.
 * Returns the moved component, or undefined if either path failed to resolve
 */
export const moveTopLevelComponentByPath = (
  root: APIMessageTopLevelComponent[],
  from: ComponentPath,
  to: ComponentPath,
): APIMessageTopLevelComponent | undefined => {
  const src = resolveTopLevelPath(root, from);
  const dest = resolveTopLevelPath(root, to);
  if (!src || !dest) return undefined;
  return spliceMove(src.array, src.index, dest.array, dest.index);
};

/**
 * prevent containers from being dropped inside of other containers, and other
 * such guards in the future
 */
export const isTopLevelDropValid = (
  draggedType: APIMessageTopLevelComponent["type"] | undefined,
  destParentType: ComponentType.Container | undefined,
): boolean => {
  if (draggedType === undefined) return false;
  return !(
    draggedType === ComponentType.Container &&
    destParentType === ComponentType.Container
  );
};

/** Resolves an action row by its own path for use as a drop target */
export const resolveActionRow = (
  root: APIMessageTopLevelComponent[],
  rowPath: ComponentPath,
): APIActionRowComponent<APIComponentInMessageActionRow> | undefined => {
  const resolved = resolveTopLevelPath(root, rowPath);
  if (!resolved) return undefined;
  const row = resolved.array[resolved.index];
  if (!row || row.type !== ComponentType.ActionRow) return undefined;
  return row as APIActionRowComponent<APIComponentInMessageActionRow>;
};

const pathsEqual = (a: ComponentPath, b: ComponentPath): boolean =>
  a.length === b.length && a.every((v, i) => v === b[i]);

export interface ActionRowDragData {
  width: number;
  /** Path to the current row of the dragged component */
  rowPath: ComponentPath;
  /** The dragged component's current index in its row */
  index: number;
}

/** Prevents invalid drops into action rows */
export const isRowDropValid = (
  dragData: ActionRowDragData | undefined,
  destRow: APIActionRowComponent<APIComponentInMessageActionRow> | undefined,
  destRowPath: ComponentPath,
): boolean => {
  if (!dragData || !destRow) return false;
  const isSameRow = pathsEqual(dragData.rowPath, destRowPath);
  const otherComponents = isSameRow
    ? destRow.components.filter((_, idx) => idx !== dragData.index)
    : destRow.components;
  if (dragData.width === MAX_ACTION_ROW_WIDTH && otherComponents.length > 0)
    return false;
  if (
    otherComponents.some((c) => getComponentWidth(c) === MAX_ACTION_ROW_WIDTH)
  )
    return false;
  const currentWidth = otherComponents.reduce(
    (sum, c) => sum + getComponentWidth(c),
    0,
  );
  return currentWidth + dragData.width <= MAX_ACTION_ROW_WIDTH;
};

/**
 * Move row components betwixt rows. TODO: move to/from sections & auto
 * convert to/from section/text display?
 */
export const moveActionRowComponent = (
  sourceRow: APIActionRowComponent<APIComponentInMessageActionRow>,
  sourceIndex: number,
  destRow: APIActionRowComponent<APIComponentInMessageActionRow>,
  destIndex: number,
): APIComponentInMessageActionRow | undefined =>
  spliceMove(sourceRow.components, sourceIndex, destRow.components, destIndex);

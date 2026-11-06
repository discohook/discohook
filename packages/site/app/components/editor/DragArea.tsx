import type {
  APIActionRowComponent,
  ComponentType,
} from "discord-api-types/v10";
import { twJoin } from "tailwind-merge";
import type { APIComponentInMessageActionRow } from "~/types/QueryData";
import {
  type ComponentPath,
  isRowDropValid,
  isTopLevelDropValid,
} from "~/util/componentTree";
import { type DragManager, DragType, getDragData } from "~/util/drag";
import { usePointerDropZone } from "~/util/usePointerDrag";

export const DragArea = ({
  active,
  focused,
}: {
  /** A compatible drag is in progress and this zone is a valid target */
  active: boolean;
  /** The pointer is over this specific zone right now */
  focused: boolean;
}) => {
  return (
    <div
      className={twJoin(
        "transition-all duration-100 rounded-md",
        focused
          ? "h-14 my-1 border-2 border-dashed border-[#3C8D40] bg-[#3C8D40]/10"
          : active
            ? "h-2 my-0.5 bg-gray-300 dark:bg-gray-600"
            : "h-0 my-0",
      )}
    />
  );
};

/** Wraps one slot in a components list with `DragArea`s */
export const TopLevelDropSlot: React.FC<{
  drag: DragManager | undefined;
  dropKey: string;
  destParentType: ComponentType.Container | undefined;
  onDrop: (isAfter: boolean) => void;
  children: React.ReactNode;
}> = ({ drag, dropKey, destParentType, onDrop, children }) => {
  const valid = isTopLevelDropValid(
    getDragData(drag, DragType.TopLevelComponent)?.type,
    destParentType,
  );
  const dropZone = usePointerDropZone(drag, dropKey, valid, () =>
    onDrop(dropZone.isAfter),
  );
  const focused = drag?.isFocused(dropKey) ?? false;
  return (
    <div
      onPointerEnter={dropZone.onPointerEnter}
      onPointerLeave={dropZone.onPointerLeave}
      onPointerMove={dropZone.onPointerMove}
      onPointerUp={dropZone.onPointerUp}
    >
      <DragArea
        active={valid && !focused}
        focused={focused && !dropZone.isAfter}
      />
      {children}
      <DragArea active={false} focused={focused && dropZone.isAfter} />
    </div>
  );
};

/** always present drop target for an empty message/container */
export const TopLevelEmptyDropSlot: React.FC<{
  drag: DragManager | undefined;
  dropKey: string;
  destParentType: ComponentType.Container | undefined;
  onDrop: () => void;
}> = ({ drag, dropKey, destParentType, onDrop }) => {
  const valid = isTopLevelDropValid(
    getDragData(drag, DragType.TopLevelComponent)?.type,
    destParentType,
  );
  const dropZone = usePointerDropZone(drag, dropKey, valid, onDrop);
  const focused = drag?.isFocused(dropKey) ?? false;
  return (
    <div
      className={twJoin(
        "transition-all duration-100 rounded border border-dashed border-gray-400 dark:border-gray-600",
        focused ? "h-14 border-[#3C8D40] bg-[#3C8D40]/10" : "h-8",
      )}
      onPointerEnter={dropZone.onPointerEnter}
      onPointerLeave={dropZone.onPointerLeave}
      onPointerMove={dropZone.onPointerMove}
      onPointerUp={dropZone.onPointerUp}
    />
  );
};

/** ActionRow equivalent of `TopLevelDropSlot` */
export const ActionRowDropSlot: React.FC<{
  drag: DragManager | undefined;
  dropKey: string;
  row: APIActionRowComponent<APIComponentInMessageActionRow>;
  rowPath: ComponentPath;
  onDrop: (isAfter: boolean) => void;
  children: React.ReactNode;
}> = ({ drag, dropKey, row, rowPath, onDrop, children }) => {
  const valid = isRowDropValid(
    getDragData(drag, DragType.ActionRowComponent),
    row,
    rowPath,
  );
  const dropZone = usePointerDropZone(drag, dropKey, valid, () =>
    onDrop(dropZone.isAfter),
  );
  const focused = drag?.isFocused(dropKey) ?? false;
  return (
    <div
      onPointerEnter={dropZone.onPointerEnter}
      onPointerLeave={dropZone.onPointerLeave}
      onPointerMove={dropZone.onPointerMove}
      onPointerUp={dropZone.onPointerUp}
    >
      <DragArea
        active={valid && !focused}
        focused={focused && !dropZone.isAfter}
      />
      {children}
      <DragArea active={false} focused={focused && dropZone.isAfter} />
    </div>
  );
};

/** always present drop target for an empty action row */
export const ActionRowEmptyDropSlot: React.FC<{
  drag: DragManager | undefined;
  dropKey: string;
  row: APIActionRowComponent<APIComponentInMessageActionRow>;
  rowPath: ComponentPath;
  onDrop: () => void;
}> = ({ drag, dropKey, row, rowPath, onDrop }) => {
  const valid = isRowDropValid(
    getDragData(drag, DragType.ActionRowComponent),
    row,
    rowPath,
  );
  const dropZone = usePointerDropZone(drag, dropKey, valid, onDrop);
  const focused = drag?.isFocused(dropKey) ?? false;
  return (
    <div
      className={twJoin(
        "transition-all duration-100 rounded border border-dashed border-gray-400 dark:border-gray-600",
        focused ? "h-14 border-[#3C8D40] bg-[#3C8D40]/10" : "h-8",
      )}
      onPointerEnter={dropZone.onPointerEnter}
      onPointerLeave={dropZone.onPointerLeave}
      onPointerMove={dropZone.onPointerMove}
      onPointerUp={dropZone.onPointerUp}
    />
  );
};

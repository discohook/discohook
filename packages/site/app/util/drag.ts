import type { APIMessageTopLevelComponent } from "discord-api-types/v10";
import { useRef, useState } from "react";
import type { ActionRowDragData, ComponentPath } from "./componentTree";

export enum DragType {
  // message elements
  Embed = 100,
  Attachment = 101,
  TopLevelComponent = 102,
  ActionRowComponent = 103,
  SelectOption = 104,
  SectionText = 105,
  GalleryItem = 106,
  // misc standalone
  Backup = 200,
}

type DragDataMap = {
  [DragType.Embed]: null;
  [DragType.Attachment]: null;
  [DragType.TopLevelComponent]: {
    type: APIMessageTopLevelComponent["type"];
    path: ComponentPath;
    /** Preview text shown in the floating drag ghost. */
    label: string;
  };
  [DragType.ActionRowComponent]: ActionRowDragData & { label: string };
  [DragType.SelectOption]: null;
  [DragType.SectionText]: null;
  [DragType.GalleryItem]: null;
  [DragType.Backup]: null;
};

export type DragData<T extends keyof DragDataMap> = DragDataMap[T];

export type OnDropCallback = (scopeId: string, args: unknown) => void;

interface DragManagerState {
  type: DragType | null;
  data?: DragData<DragType>;
  onDrop?: OnDropCallback;
  /** unique component key for the element being hovered over */
  focusedKey?: string;
}

type PointerMoveListener = (x: number, y: number) => void;

export class DragManager {
  constructor(
    private state: DragManagerState,
    private setState: React.Dispatch<React.SetStateAction<DragManagerState>>,
    /**
     * subscribing doesn't rerun all the time because this is ref-based and
     * stable across renders
     */
    private pointerListeners: Set<PointerMoveListener>,
  ) {}

  get type() {
    return this.state.type;
  }

  get data() {
    return this.state.data;
  }

  get onDrop() {
    return this.state.onDrop;
  }

  get active() {
    return this.type !== null;
  }

  start<T extends DragType>(
    type: T,
    options?: {
      data?: DragData<T>;
      onDrop?: OnDropCallback;
    },
  ) {
    this.setState({ type, data: options?.data, onDrop: options?.onDrop });
  }

  isFocused(key: string): boolean {
    return this.state.focusedKey === `${this.state.type}-${key}`;
  }

  /**
   * Set a focus key for the current drag session. This key is prepended with
   * the dragtype so that it does not overlap with drag areas for other types.
   * If there is no type (session is not active), this function does nothing.
   */
  setFocusKey(key: string | undefined) {
    if (!this.active) return;
    this.setState({ ...this.state, focusedKey: `${this.state.type}-${key}` });
  }

  end() {
    this.setState({ type: null });
  }

  /**
   * Called by the active pointer-drag source on every `pointermove`.
   * Pretty much just for the drag label functionality
   */
  reportPointerMove(x: number, y: number) {
    for (const cb of this.pointerListeners) cb(x, y);
  }

  /** Returns an unsubscribe function */
  subscribePointerMove(cb: PointerMoveListener): () => void {
    this.pointerListeners.add(cb);
    return () => {
      this.pointerListeners.delete(cb);
    };
  }
}

/**
 * type "guard" for `drag.data` to be a specific `DragType`. we should
 * probably make this more ts-native somehow since this is kinda yucky
 */
export function getDragData<T extends DragType>(
  drag: DragManager | undefined,
  type: T,
): DragData<T> | undefined {
  return drag?.type === type ? (drag.data as DragData<T>) : undefined;
}

export const useDragManager = () => {
  const [state, setState] = useState<DragManagerState>({ type: null });
  const pointerListeners = useRef(new Set<PointerMoveListener>()).current;
  return new DragManager(state, setState, pointerListeners);
};

import type {
  APIMessageTopLevelComponent,
  ComponentType,
} from "discord-api-types/v10";
import { useState } from "react";

export enum DragType {
  Embed = 0,
  Attachment = 1,
  TopLevelComponent = 2,
  ActionRowComponent = 3,
  SelectOption = 4,
  SectionText = 5,
  GalleryItem = 6,
}

type DragDataMap = {
  [DragType.Embed]: null;
  [DragType.Attachment]: null;
  [DragType.TopLevelComponent]: {
    type: APIMessageTopLevelComponent["type"];
    index: number;
    parentType?: ComponentType.Container;
  };
  [DragType.ActionRowComponent]: null;
  [DragType.SelectOption]: null;
  [DragType.SectionText]: null;
  [DragType.GalleryItem]: null;
};

type DragData<T extends keyof DragDataMap> = DragDataMap[T];

type OnDropCallback = (messageId: string, args: unknown) => void;

interface DragManagerState {
  type: DragType | null;
  data?: DragData<DragType>;
  onDrop?: OnDropCallback;
  /** unique component key for the element being hovered over */
  focusedKey?: string;
}

export class DragManager {
  constructor(
    private state: DragManagerState,
    private setState: React.Dispatch<React.SetStateAction<DragManagerState>>,
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
}

export const useDragManager = () => {
  const [data, setData] = useState<DragManagerState>({ type: null });
  return new DragManager(data, setData);
};

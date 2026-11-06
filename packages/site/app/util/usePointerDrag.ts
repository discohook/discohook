import { useRef, useState } from "react";
import type { DragData, DragManager, DragType, OnDropCallback } from "./drag";

const DRAG_THRESHOLD_PX = 6;

interface DragStartPayload<T extends DragType> {
  data: DragData<T>;
  onDrop: OnDropCallback;
}

// logic for grab handles
export function usePointerDragSource<T extends DragType>(
  drag: DragManager | undefined,
  type: T,
  start: () => DragStartPayload<T> | null,
): { onPointerDown: (e: React.PointerEvent) => void; dragging: boolean } {
  const [dragging, setDragging] = useState(false);
  const trackingRef = useRef<{
    x: number;
    y: number;
    dragging: boolean;
  } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!drag || (e.pointerType === "mouse" && e.button !== 0)) return;
    const target = e.target as Element;
    if (target.hasPointerCapture?.(e.pointerId)) {
      target.releasePointerCapture(e.pointerId);
    }
    const startX = e.clientX;
    const startY = e.clientY;
    trackingRef.current = { x: startX, y: startY, dragging: false };

    const onMove = (ev: PointerEvent) => {
      const tracking = trackingRef.current;
      if (!tracking) return;
      if (!tracking.dragging) {
        const dx = ev.clientX - tracking.x;
        const dy = ev.clientY - tracking.y;
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
        const payload = start();
        if (!payload) {
          trackingRef.current = null;
          return;
        }
        tracking.dragging = true;
        setDragging(true);
        drag.start(type, payload);
      }
      drag.reportPointerMove(ev.clientX, ev.clientY);
    };

    const cleanup = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
    // fallback in case the pointer is released over something that's not a
    // valid drop zone
    const onUp = () => {
      cleanup();
      if (trackingRef.current?.dragging) drag.end();
      trackingRef.current = null;
      setDragging(false);
    };
    const onCancel = () => {
      cleanup();
      drag.end();
      trackingRef.current = null;
      setDragging(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
  };

  return { onPointerDown, dragging };
}

// logic for drop zones
export function usePointerDropZone(
  drag: DragManager | undefined,
  key: string,
  valid: boolean,
  onDrop: () => void,
): {
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  isAfter: boolean;
} {
  const [isAfter, setIsAfter] = useState(false);

  return {
    // Focus is tracked only via onPointerEnter/onPointerLeave, which does not
    // "bubble", unlike onPointerMove. This matters when drop zones are nested
    // inside each other
    onPointerEnter: () => {
      if (valid) drag?.setFocusKey(key);
    },
    onPointerLeave: () => drag?.setFocusKey(undefined),
    onPointerMove: (e) => {
      if (!valid || !drag?.active) return;
      const rect = e.currentTarget.getBoundingClientRect();
      // most top-level zones are quite tall when open, and a user dropping just
      // past the titlebar probably expects the item to go after the zone, so we
      // cap the threshold to keep the split near the titlebar height for tall
      // zones
      const threshold = Math.min(rect.height / 2, 48);
      setIsAfter(e.clientY > rect.top + threshold);
    },
    onPointerUp: () => {
      if (valid && drag?.isFocused(key)) onDrop();
    },
    isAfter,
  };
}

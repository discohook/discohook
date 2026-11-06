import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { DragManager } from "~/util/drag";

/**
 * Floating label to indicate what's being dragged
 */
export const DragLabel: React.FC<{ drag: DragManager }> = ({ drag }) => {
  const ref = useRef<HTMLDivElement>(null);

  // `drag` may be a new object on each render so we key this effect on
  // `drag.active` instead
  // biome-ignore lint/correctness/useExhaustiveDependencies: ^
  useEffect(() => {
    if (!drag.active) return;
    return drag.subscribePointerMove((x, y) => {
      if (ref.current) {
        ref.current.style.transform = `translate(${x + 12}px, ${y + 12}px)`;
      }
    });
  }, [drag.active]);

  if (!drag.active || !drag.data || !("label" in drag.data)) return null;

  return createPortal(
    <div
      ref={ref}
      className="fixed top-0 left-0 z-50 pointer-events-none px-3 py-1.5 rounded-md bg-gray-200 dark:bg-gray-700 shadow-lg text-sm font-semibold max-w-xs truncate"
    >
      {drag.data.label}
    </div>,
    document.body,
  );
};

import { useState, useEffect } from "react";
import { Popover } from "@base-ui/react/popover";
import type { TFunction } from "~/types/i18next";
import {
  ColorPicker,
  decimalToHex,
  decimalToRgb,
  rgbToDecimal,
} from "../editor/ColorPicker";
import { popoverStyles } from "./Popover";

export const ColorPickerPopoverWithTrigger = ({
  t,
  value,
  onValueChange,
}: {
  t: TFunction;
  value: number | null | undefined;
  onValueChange: (color: number | undefined) => void;
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setLocalValue(value);
    }
  }, [value, isOpen]);

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open && localValue !== value) {
          onValueChange(localValue ?? undefined);
        }
      }}
    >
      <Popover.Trigger className="flex cursor-pointer text-start">
        <div className="grow">
          <p className="text-sm font-medium">{t("sidebarColor")}</p>
          <p className="rounded-lg border h-9 py-0 px-[14px] bg-white border-border-normal dark:bg-[#333338] dark:border-border-normal-dark">
            <span className="align-middle">
              {typeof localValue === "number"
                ? decimalToHex(localValue)
                : t("clickToSet")}
            </span>
          </p>
        </div>
        <div
          className="size-9 mt-auto rounded-lg ms-2 bg-gray-500"
          style={{
            backgroundColor:
              typeof localValue === "number" ? decimalToHex(localValue) : undefined,
          }}
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          className="z-[35]"
          // label is part of the trigger so it looks weird unless we trim some padding
          sideOffset={(s) => (s.side === "top" ? -12 : 8)}
        >
          <Popover.Popup className={popoverStyles.popup}>
            <ColorPicker
              t={t}
              color={
                typeof localValue === "number" ? decimalToRgb(localValue) : undefined
              }
              onChange={(color) => setLocalValue(rgbToDecimal(color.rgb))}
              onReset={() => {
                setLocalValue(undefined);
                onValueChange(undefined);
                setIsOpen(false);
              }}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
};

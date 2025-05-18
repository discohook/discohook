import { Popover } from "@base-ui-components/react/popover";
import { TFunction } from "i18next";
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
  return (
    <Popover.Root>
      <Popover.Trigger className="flex cursor-pointer text-start">
        <div className="grow">
          <p className="text-sm font-medium">{t("sidebarColor")}</p>
          <p className="rounded-lg border h-9 py-0 px-[14px] bg-white border-border-normal dark:bg-[#333338] dark:border-border-normal-dark">
            <span className="align-middle">
              {typeof value === "number"
                ? decimalToHex(value)
                : t("clickToSet")}
            </span>
          </p>
        </div>
        <div
          className="h-9 w-9 mt-auto rounded-lg ltr:ml-2 rtl:mr-2 bg-gray-500"
          style={{
            backgroundColor:
              typeof value === "number" ? decimalToHex(value) : undefined,
          }}
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner
          // label is part of the trigger so it looks weird unless we trim some padding
          sideOffset={(s) => (s.side === "top" ? -12 : 8)}
        >
          <Popover.Popup className={popoverStyles.popup}>
            <ColorPicker
              t={t}
              color={
                typeof value === "number" ? decimalToRgb(value) : undefined
              }
              onChange={(color) => onValueChange(rgbToDecimal(color.rgb))}
              onReset={() => onValueChange(undefined)}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
};

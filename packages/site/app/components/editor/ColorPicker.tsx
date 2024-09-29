import { TFunction } from "i18next";
import {
  Color,
  CustomPicker,
  InjectedColorProps,
  SketchPicker,
} from "react-color";
import { Button } from "../Button";

const ColorPickerFunction: React.FC<
  InjectedColorProps & { t?: TFunction; onReset?: () => void }
> = (props) => (
  <div className="w-fit rounded border border-gray-50 bg-gray-50 dark:border-gray-700 dark:bg-gray-700 dark:text-primary-230 shadow-md">
    <SketchPicker
      {...props}
      styles={{
        default: {
          picker: {
            borderWidth: 0,
            backgroundColor: "transparent",
            boxShadow: "none",
          },
          saturation: {
            borderRadius: ".25rem",
          },
        },
      }}
      presetColors={[
        "#1ABC9C",
        // "#11806A",
        "#2ECC71",
        // "#1F8B4C",
        "#3498DB",
        // "#206694",
        "#9B59B6",
        // "#71368A",
        "#E91E63",
        // "#AD1457",
        "#F1C40F",
        // "#C27C0E",
        "#E67E22",
        // "#A84300",
        "#E74C3C",
        // "#992D22",
        "#95A5A6",
        // "#979C9F",
        "#607D8B",
        // "#546E7A",
        // Dark mode embed body
        "#2F3136",
        // Light mode embed body
        "#F2F3F5",
      ]}
      disableAlpha
    />
    {!!props.onReset && (
      <div className="flex p-2 pt-0">
        <div className="flex gap-2 ml-auto">
          <Button onClick={props.onReset}>
            {props.t ? props.t("reset") : "Reset"}
          </Button>
        </div>
      </div>
    )}
  </div>
);

export const ColorPicker = CustomPicker(ColorPickerFunction);

export const rgbToDecimal = (rgb: { r: number; g: number; b: number }) =>
  (rgb.r << 16) + (rgb.g << 8) + rgb.b;

export const decimalToRgb = (decimal: number): Color => ({
  r: (decimal & 0xff0000) >> 16,
  g: (decimal & 0x00ff00) >> 8,
  b: decimal & 0x0000ff,
  a: 1,
});

export const decimalToHex = (decimal: number) =>
  `#${decimal.toString(16).padStart(6, "0")}`;

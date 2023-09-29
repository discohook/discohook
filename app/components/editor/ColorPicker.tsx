import { CustomPicker, InjectedColorProps, SketchPicker } from "react-color";
import { Button } from "../Button";

const ColorPickerFunction: React.FC<InjectedColorProps> = (props) => (
  <div className="absolute right-0 top-16 w-fit rounded border border-gray-50 bg-gray-50 dark:border-gray-700 dark:bg-gray-700 dark:text-[#dbdee1] shadow-md">
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
      ]}
      disableAlpha
    />
    <div className="flex p-2 pt-0">
      <Button
        className="ml-auto"
        onClick={() => {
          if (props.onChange) {
            props.onChange({ a: 0, r: 0, g: 0, b: 0 });
          }
        }}
      >
        Reset
      </Button>
    </div>
  </div>
);

export const ColorPicker = CustomPicker(ColorPickerFunction);

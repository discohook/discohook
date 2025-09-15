import { twJoin } from "tailwind-merge";

export const DragArea = ({
  visible,
  position,
  onDrop,
}: {
  visible: boolean;
  position: "top" | "bottom";
  onDrop: () => void;
}) => {
  const getProps = (): React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > => ({
    onDragOver: (e) => e.preventDefault(),
    onDragEnter: (e) => e.preventDefault(),
    onDrop: () => onDrop(),
  });

  return (
    <div
      className={twJoin(
        visible
          ? "h-auto opacity-100 pointer-events-auto"
          : "h-0 opacity-0 pointer-events-none",
        "absolute inset-0 flex",
        position === "top" ? "-top-1" : "-bottom-1",
      )}
      {...getProps()}
    >
      <div
        className={twJoin(
          "rounded-full bg-[#3C8D40] w-full h-1",
          position === "top" ? "mb-auto" : "mt-auto",
        )}
      />
    </div>
  );
};

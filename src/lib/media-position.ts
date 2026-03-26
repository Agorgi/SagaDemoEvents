export type MediaVerticalPosition = "top" | "center" | "bottom";

export const mediaPositionOptions: Array<{
  value: MediaVerticalPosition;
  label: string;
}> = [
  { value: "top", label: "Top" },
  { value: "center", label: "Center" },
  { value: "bottom", label: "Bottom" }
];

export function getMediaObjectPosition(position?: MediaVerticalPosition) {
  if (position === "top") {
    return "center top";
  }

  if (position === "bottom") {
    return "center bottom";
  }

  return "center center";
}

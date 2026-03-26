"use client";

import { FilterChip } from "@/src/components/Chips";
import {
  mediaPositionOptions,
  type MediaVerticalPosition
} from "@/src/lib/media-position";

export function ImagePositionPicker({
  value = "center",
  onChange,
  label = "Image focus"
}: {
  value?: MediaVerticalPosition;
  onChange: (value: MediaVerticalPosition) => void;
  label?: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-white">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {mediaPositionOptions.map((option) => (
          <FilterChip
            active={value === option.value}
            key={option.value}
            label={option.label}
            onClick={() => onChange(option.value)}
          />
        ))}
      </div>
    </div>
  );
}

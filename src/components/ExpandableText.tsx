"use client";

import { useState } from "react";

import { cn } from "@/src/lib/utils";

export function ExpandableText({
  text,
  collapsedLines = 3,
  className,
  buttonClassName
}: {
  text: string;
  collapsedLines?: number;
  className?: string;
  buttonClassName?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!text.trim()) {
    return null;
  }

  return (
    <div>
      <p
        className={cn("text-sm leading-6 text-app-muted", className)}
        style={
          expanded
            ? undefined
            : {
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: collapsedLines,
                overflow: "hidden"
              }
        }
      >
        {text}
      </p>
      {text.length > 120 ? (
        <button
          className={cn(
            "mt-2 text-sm font-semibold text-white/80 transition hover:text-white",
            buttonClassName
          )}
          onClick={() => setExpanded((current) => !current)}
          type="button"
        >
          {expanded ? "Show less" : "Read more…"}
        </button>
      ) : null}
    </div>
  );
}

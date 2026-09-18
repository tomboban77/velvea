"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** "dark" for the admin screens on the plum background. */
  tone?: "light" | "dark";
  showLabel?: string;
  hideLabel?: string;
};

/**
 * Password field with a show/hide toggle. Renders exactly like the input it
 * wraps (pass the same className) plus an eye button inside the right edge.
 */
export function PasswordInput({
  className,
  tone = "light",
  showLabel = "Show password",
  hideLabel = "Hide password",
  ...rest
}: Props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input {...rest} type={visible ? "text" : "password"} className={cn(className, "pr-12")} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
        title={visible ? hideLabel : showLabel}
        className={cn(
          "absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full transition-colors",
          tone === "dark"
            ? "text-canvas/60 hover:bg-white/10 hover:text-canvas"
            : "text-muted hover:bg-lilac hover:text-violet-deep"
        )}
      >
        {visible ? <EyeOff className="h-[18px] w-[18px]" strokeWidth={1.7} /> : <Eye className="h-[18px] w-[18px]" strokeWidth={1.7} />}
      </button>
    </div>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = { value: string; label: string };

/**
 * Custom listbox. Two voices:
 *  - "phrase": large italic display type with a gold underline, for the
 *    sentence-style gift finder.
 *  - "quiet": compact label/value pair for filters and sort.
 */
export function Select({
  value,
  onChange,
  options,
  ariaLabel,
  variant = "quiet",
  className,
  align = "left",
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  ariaLabel: string;
  variant?: "phrase" | "quiet";
  className?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (open) setActive(Math.max(0, options.findIndex((o) => o.value === value)));
  }, [open, options, value]);

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      else setActive((a) => Math.min(options.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) setOpen(true);
      else {
        onChange(options[active].value);
        setOpen(false);
      }
    }
  }

  return (
    <div ref={root} className={cn("relative inline-block", className)} onKeyDown={onKey}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group inline-flex items-center gap-2 text-left transition-colors",
          variant === "phrase"
            ? "border-b border-lilac-deep pb-0.5 font-display text-[1.45em] italic leading-none text-violet-deep hover:text-violet"
            : "border border-line-strong bg-shell px-3 py-2 text-sm font-medium text-ink hover:border-ink"
        )}
      >
        <span className="whitespace-nowrap">{current?.label}</span>
        <ChevronDown
          className={cn(
            "shrink-0 text-violet transition-transform duration-300",
            variant === "phrase" ? "h-[0.55em] w-[0.55em]" : "h-3.5 w-3.5",
            open && "rotate-180"
          )}
          strokeWidth={1.6}
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            "absolute z-40 mt-3 max-h-80 min-w-[14rem] overflow-y-auto border border-line-strong bg-shell py-2 shadow-[0_24px_50px_-24px_rgba(36,27,54,0.35)]",
            align === "right" ? "right-0" : "left-0"
          )}
          style={{ animation: "velvea-rise 0.25s var(--ease-out-soft)" }}
        >
          {options.map((o, i) => {
            const selected = o.value === value;
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-6 px-4 py-2.5 font-sans text-[0.95rem] text-ink transition-colors",
                  i === active && "bg-cream",
                  selected && "text-violet-deep"
                )}
              >
                <span>{o.label}</span>
                {selected && <Check className="h-3.5 w-3.5 text-violet" strokeWidth={2} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

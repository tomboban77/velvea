"use client";

import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  ...props
}: {
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <input
      {...props}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn("field", props.className)}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 4,
  ...props
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value">) {
  return (
    <textarea
      {...props}
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn("field resize-y", props.className)}
    />
  );
}

/** English + French pair for a translatable field. */
export function LocalizedInput({
  label,
  en,
  fr,
  onEn,
  onFr,
  textarea,
  rows,
  placeholder,
}: {
  label: string;
  en: string;
  fr: string;
  onEn: (v: string) => void;
  onFr: (v: string) => void;
  textarea?: boolean;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="relative">
          <span className="pointer-events-none absolute right-3 top-3 text-[0.6rem] font-bold uppercase tracking-wider text-muted">
            EN
          </span>
          {textarea ? (
            <TextArea value={en} onChange={onEn} rows={rows} placeholder={placeholder} />
          ) : (
            <TextInput value={en} onChange={onEn} placeholder={placeholder} />
          )}
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute right-3 top-3 text-[0.6rem] font-bold uppercase tracking-wider text-muted">
            FR
          </span>
          {textarea ? (
            <TextArea value={fr} onChange={onFr} rows={rows} placeholder="Optionnel" />
          ) : (
            <TextInput value={fr} onChange={onFr} placeholder="Optionnel" />
          )}
        </div>
      </div>
    </div>
  );
}

export function MoneyInput({
  cents,
  onChange,
  placeholder,
}: {
  cents: number | null;
  onChange: (cents: number | null) => void;
  placeholder?: string;
}) {
  const value = cents === null || cents === undefined ? "" : (cents / 100).toString();
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
        $
      </span>
      <input
        type="number"
        step="0.01"
        min="0"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? null : Math.round(parseFloat(v) * 100));
        }}
        className="field pl-7"
      />
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-3 rounded-xl border border-line bg-shell p-3 text-left transition-colors hover:border-line-strong"
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors",
          checked ? "bg-iris" : "bg-sand"
        )}
      >
        <span
          className={cn(
            "h-4 w-4 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-4"
          )}
        />
      </span>
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="block text-xs text-muted">{description}</span>}
      </span>
    </button>
  );
}

export function Select({
  value,
  onChange,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn("field appearance-none bg-shell", className)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

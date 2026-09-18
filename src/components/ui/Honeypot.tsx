"use client";

/**
 * Off-screen decoy field. Automated form-fillers populate every input they
 * find; a person never sees this one, so any value in it marks the submission
 * as a bot. Positioned off-canvas rather than `display:none`, which some
 * scripts skip.
 */
export function Honeypot({
  name = "company",
  value,
  onChange,
}: {
  name?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div aria-hidden className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
      <label htmlFor={`hp-${name}`}>Leave this field empty</label>
      <input
        id={`hp-${name}`}
        name={name}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

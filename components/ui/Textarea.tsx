import type { TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export function Textarea({ label, error, className = "", id, ...rest }: TextareaProps) {
  const tid = id ?? rest.name;
  return (
    <label className="flex flex-col gap-1.5 text-base" htmlFor={tid}>
      {label ? (
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
          {label}
        </span>
      ) : null}
      <textarea
        id={tid}
        className={`input-wow min-h-[120px] resize-y ${className}`}
        {...rest}
      />
      {error ? (
        <span className="text-sm text-[var(--status-full)]">{error}</span>
      ) : null}
    </label>
  );
}

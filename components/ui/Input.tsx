import type { InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className = "", id, ...rest }: InputProps) {
  const inputId = id ?? rest.name;
  return (
    <label className="flex flex-col gap-1.5 text-base" htmlFor={inputId}>
      {label ? (
        <span className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
          {label}
        </span>
      ) : null}
      <input id={inputId} className={`input-wow ${className}`} {...rest} />
      {error ? (
        <span className="text-sm text-[var(--status-full)]">{error}</span>
      ) : null}
    </label>
  );
}

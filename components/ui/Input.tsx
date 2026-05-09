import type { InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className = "", id, ...rest }: InputProps) {
  const inputId = id ?? rest.name;
  return (
    <label className="flex flex-col gap-1 text-sm" htmlFor={inputId}>
      {label ? (
        <span className="font-display text-xs uppercase tracking-widest text-[var(--text-secondary)]">
          {label}
        </span>
      ) : null}
      <input id={inputId} className={`input-wow ${className}`} {...rest} />
      {error ? (
        <span className="text-xs text-[var(--status-full)]">{error}</span>
      ) : null}
    </label>
  );
}

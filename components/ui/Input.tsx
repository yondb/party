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
        <span className="text-sm font-semibold text-[var(--text-secondary)]">
          {label}
        </span>
      ) : null}
      <input
        id={inputId}
        className={`input-wow ${error ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/50" : ""} ${className}`}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {error ? (
        <span className="text-sm text-[var(--accent)]">{error}</span>
      ) : null}
    </label>
  );
}

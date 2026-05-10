import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  fullWidth,
  type = "button",
  className = "",
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-md px-4 py-3 text-base transition disabled:opacity-45 disabled:pointer-events-none";
  const v =
    variant === "primary"
      ? "btn-primary"
      : variant === "danger"
        ? "btn-danger"
        : "btn-secondary";
  const w = fullWidth ? "w-full" : "";
  return (
    <button type={type} className={`${base} ${v} ${w} ${className}`} {...rest} />
  );
}

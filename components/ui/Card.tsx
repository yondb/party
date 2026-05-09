import type { HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  accentColor?: string;
};

export function Card({
  className = "",
  accentColor,
  children,
  style,
  ...rest
}: CardProps) {
  return (
    <div
      className={`wow-card wow-card-hover relative overflow-hidden p-4 ${className}`}
      style={{
        ...(accentColor
          ? { borderTopColor: accentColor, borderTopWidth: 2, borderTopStyle: "solid" as const }
          : {}),
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

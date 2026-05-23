import type { HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  accentColor?: string;
  hover?: boolean;
};

export function Card({
  className = "",
  accentColor,
  hover = false,
  children,
  style,
  ...rest
}: CardProps) {
  return (
    <div
      className={`card relative overflow-hidden p-4 ${hover ? "card-hover" : ""} ${className}`}
      style={{
        ...(accentColor
          ? { borderTopColor: accentColor, borderTopWidth: 3, borderTopStyle: "solid" as const }
          : {}),
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

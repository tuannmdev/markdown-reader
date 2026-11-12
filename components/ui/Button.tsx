import Link from "next/link";
import type { ReactNode } from "react";
import styles from "@/components/ui/Button.module.css";

interface ButtonProps {
  variant?: "primary" | "secondary" | "dashed";
  size?: "md" | "sm";
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "secondary",
  size = "md",
  href,
  type = "button",
  disabled,
  onClick,
  icon,
  className,
  children,
}: ButtonProps) {
  const classes = [styles.button, styles[variant], size === "sm" ? styles.sm : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
  const content = (
    <>
      {icon}
      <span>{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick}>
      {content}
    </button>
  );
}

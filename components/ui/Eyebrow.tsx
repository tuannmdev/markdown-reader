import type { ReactNode } from "react";
import styles from "@/components/ui/Eyebrow.module.css";

interface EyebrowProps {
  active?: boolean;
  children: ReactNode;
}

export function Eyebrow({ active, children }: EyebrowProps) {
  return <p className={[styles.eyebrow, active ? styles.active : ""].filter(Boolean).join(" ")}>{children}</p>;
}

import type { IconProps } from "@/components/ui/IconProps";

export function IconTextSize({ className, size = 20 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M2.5 19 8 5l5.5 14M4.6 14h6.8" />
      <circle cx="18" cy="16.5" r="2.5" />
      <path d="M20.5 14v5" />
    </svg>
  );
}

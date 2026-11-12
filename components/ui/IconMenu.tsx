import type { IconProps } from "@/components/ui/IconProps";

export function IconMenu({ className, size = 20 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  );
}

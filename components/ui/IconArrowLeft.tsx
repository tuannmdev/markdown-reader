import type { IconProps } from "@/components/ui/IconProps";

export function IconArrowLeft({ className, size = 18 }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

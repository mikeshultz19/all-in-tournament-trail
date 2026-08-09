import type { HTMLAttributes, ReactNode } from "react";

type AdminPanelProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  variant?: "primary" | "nested";
  accent?: boolean;
};

export default function AdminPanel({ children, className = "", variant = "primary", accent = false, ...props }: AdminPanelProps) {
  const surface = variant === "primary"
    ? "bg-gradient-to-br from-[#171717] to-[#0d0d0d] shadow-[0_16px_40px_rgba(0,0,0,0.18)]"
    : "bg-black/30 shadow-none";

  return <section className={`rounded-md border border-white/10 ${surface} ${accent ? "border-l-2 border-l-red-600/70" : ""} ${className}`} {...props}>{children}</section>;
}

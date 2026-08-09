export type AdminButtonVariant = "primary" | "secondary" | "warning" | "destructive" | "ghost" | "disclosure";

const base = "inline-flex min-h-10 items-center justify-center rounded-sm px-4 text-xs font-bold uppercase tracking-[0.08em] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017] disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<AdminButtonVariant, string> = {
  primary: "bg-[#D4A017] text-black hover:bg-[#e2b22a]",
  secondary: "border border-white/15 bg-white/[0.02] text-neutral-200 hover:border-[#D4A017]/70 hover:text-[#D4A017]",
  warning: "border border-amber-500/40 bg-amber-500/5 text-amber-300 hover:bg-amber-500/10",
  destructive: "border border-red-500/40 bg-red-500/5 text-red-300 hover:bg-red-500/10",
  ghost: "px-3 text-neutral-400 hover:bg-white/5 hover:text-white",
  disclosure: "gap-1.5 px-3 text-neutral-400 hover:bg-white/5 hover:text-white",
};

export function adminButtonStyles(variant: AdminButtonVariant, className = "") {
  return `${base} ${variants[variant]} ${className}`;
}

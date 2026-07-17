import Link from "next/link";

type ActionIconProps = {
  type: "register" | "results" | "help";
};

function ActionIcon({ type }: ActionIconProps) {
  if (type === "register") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M5 21V4" strokeLinecap="round" />
        <path
          d="M6 5h10l-2.5 3L16 11H6V5Z"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "results") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          d="M8 4h8v4c0 3-1.7 5.5-4 6.7C9.7 13.5 8 11 8 8V4Z"
          strokeLinejoin="round"
        />
        <path
          d="M8 6H5v2c0 2.5 1.5 4.3 4 5M16 6h3v2c0 2.5-1.5 4.3-4 5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M12 15v4M9 20h6" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path
        d="M9.8 9a2.4 2.4 0 1 1 3.5 2.1c-.9.5-1.3 1-1.3 2"
        strokeLinecap="round"
      />
      <path d="M12 17h.01" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
    >
      <path d="M5 12h13" strokeLinecap="round" />
      <path
        d="m14 7 5 5-5 5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const buttonShape = {
  clipPath:
    "polygon(5% 0, 95% 0, 100% 25%, 100% 75%, 95% 100%, 5% 100%, 0 75%, 0 25%)",
};

const actions = [
  {
    label: "Register Now",
    href: "/register",
    icon: "register" as const,
    buttonClass:
      "border-red-500/80 bg-gradient-to-b from-red-600 to-red-800 text-white hover:from-red-500 hover:to-red-700",
    iconClass: "border-red-300/30 bg-red-950/30 text-white",
    arrowClass: "text-white",
  },
  {
    label: "Latest Results",
    href: "#winners",
    icon: "results" as const,
    buttonClass:
      "border-zinc-500/70 bg-gradient-to-b from-zinc-800 to-black text-white hover:from-zinc-700 hover:to-zinc-950",
    iconClass: "border-zinc-500/40 bg-black/30 text-yellow-400",
    arrowClass: "text-red-500",
  },
  {
    label: "How It Works",
    href: "/how-it-works",
    icon: "help" as const,
    buttonClass:
      "border-yellow-500/80 bg-gradient-to-b from-yellow-400 to-yellow-600 text-black hover:from-yellow-300 hover:to-yellow-500",
    iconClass: "border-black/20 bg-black/10 text-black",
    arrowClass: "text-black",
  },
];

export default function HeroActions() {
  return (
    <div className="border-b border-red-900/50 bg-black px-4 py-3">
      <div className="mx-auto flex max-w-[1300px] flex-wrap items-center justify-center gap-2 lg:justify-start">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            style={buttonShape}
            className={`group flex h-9 w-[205px] overflow-hidden border transition duration-200 sm:w-[220px] ${action.buttonClass}`}
          >
            <span
              className={`flex h-full w-11 shrink-0 items-center justify-center border-r ${action.iconClass}`}
            >
              <ActionIcon type={action.icon} />
            </span>

            <span className="flex min-w-0 flex-1 items-center justify-between gap-2 px-4">
              <span className="truncate text-[11px] font-black uppercase tracking-[0.1em] sm:text-xs">
                {action.label}
              </span>

              <span
                className={`transition-transform duration-200 group-hover:translate-x-1 ${action.arrowClass}`}
              >
                <ArrowIcon />
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
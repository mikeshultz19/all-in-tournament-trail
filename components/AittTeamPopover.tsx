"use client";

import { useEffect, useRef, useState } from "react";

export default function AittTeamPopover({
  placement,
}: {
  placement: "desktop" | "menu";
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverId = `aitt-team-popover-${placement}`;

  useEffect(() => {
    function closeOnOutsidePress(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={
        placement === "desktop"
          ? "relative ml-3 hidden min-[1440px]:block"
          : "relative"
      }
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (
          event.pointerType === "mouse" &&
          !containerRef.current?.contains(document.activeElement)
        ) setOpen(false);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={popoverId}
        aria-haspopup="dialog"
        onFocus={() => setOpen(true)}
        onPointerUp={(event) => {
          if (event.pointerType !== "mouse") setOpen((current) => !current);
        }}
        onClick={(event) => {
          if (event.detail === 0) setOpen(true);
        }}
        className={`cursor-pointer whitespace-nowrap leading-none text-zinc-500 transition-colors hover:text-[#d0ae4c] focus-visible:text-[#d0ae4c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 ${
          placement === "desktop"
            ? "text-[0.625rem]"
            : "min-h-8 py-2 text-[0.55rem]"
        }`}
      >
        Who’s Behind AITT?
      </button>

      {open ? (
        <div
          id={popoverId}
          role="dialog"
          aria-label="Who’s Behind AITT?"
          className={
            placement === "desktop"
              ? "absolute left-0 top-full z-20 mt-2 w-64 rounded-md border border-[#c9aa4a]/35 bg-[#101010] p-4 text-left text-xs text-zinc-400 shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
              : "fixed left-2 top-[76px] z-[130] w-[min(16rem,calc(100vw-1rem))] rounded-md border border-[#c9aa4a]/35 bg-[#101010] p-4 text-left text-xs text-zinc-400 shadow-[0_12px_30px_rgba(0,0,0,0.45)] sm:top-[104px] lg:top-[116px]"
          }
        >
          <div>
            <p className="font-semibold text-white">Mike Shultz</p>
            <p className="mt-1 text-[#d0ae4c]">
              Founder · Tournament Director · Web Design
            </p>
          </div>
          <div className="mt-3 border-t border-white/10 pt-3">
            <p className="font-semibold text-white">Brandon Ferrell</p>
            <p className="mt-1 text-[#d0ae4c]">
              Founder · Tournament Director
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

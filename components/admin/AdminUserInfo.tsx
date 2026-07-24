"use client";

import { ChevronDown, LogOut } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

interface AdminUserInfoProps {
  name: string;
  onLogout?: () => void | Promise<void>;
}

export default function AdminUserInfo({
  name,
  onLogout,
}: AdminUserInfoProps) {
  const initial = name.trim().charAt(0).toUpperCase();
  const [open, setOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const logoutRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function openMenu() {
    setOpen(true);
    setLogoutError("");
  }

  function focusMenuItem() {
    queueMicrotask(() => {
      if (onLogout) {
        logoutRef.current?.focus();
      } else {
        menuRef.current?.focus();
      }
    });
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openMenu();
      focusMenuItem();
    }
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "Home" ||
      event.key === "End"
    ) {
      event.preventDefault();
      if (onLogout) {
        logoutRef.current?.focus();
      }
    }
  }

  async function handleLogout() {
    if (!onLogout || loggingOut) {
      return;
    }

    setLoggingOut(true);
    setLogoutError("");

    try {
      await onLogout();
      setOpen(false);
    } catch {
      setLogoutError("Unable to log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => {
          setOpen((current) => !current);
          setLogoutError("");
        }}
        onKeyDown={handleTriggerKeyDown}
        className="flex min-h-11 max-w-[min(15rem,55vw)] cursor-pointer items-center gap-3 rounded-md px-1 py-1 text-left transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4A017]"
      >
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white text-sm font-black text-[#102A43] shadow-sm shadow-black/30"
        >
          {initial}
        </span>
        <span className="truncate text-sm font-black text-white sm:text-base">
          {name}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 text-neutral-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        ref={menuRef}
        id={menuId}
        role="menu"
        aria-label={`${name} user menu`}
        hidden={!open}
        tabIndex={-1}
        onKeyDown={handleMenuKeyDown}
        className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-44 max-w-[calc(100vw-2rem)] border border-white/10 bg-[#111111] p-1.5 shadow-xl shadow-black/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4A017]"
      >
        <button
          ref={logoutRef}
          type="button"
          role="menuitem"
          disabled={!onLogout || loggingOut}
          onClick={handleLogout}
          className="flex min-h-10 w-full items-center gap-2.5 rounded-sm px-3 py-2 text-left text-sm font-bold text-neutral-300 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#D4A017] disabled:cursor-not-allowed disabled:text-neutral-600"
        >
          <LogOut aria-hidden="true" className="size-4" />
          {loggingOut ? "Logging Out…" : "Log Out"}
        </button>
        {logoutError && (
          <p className="px-3 pb-2 pt-1 text-xs leading-5 text-red-400" role="alert">
            {logoutError}
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";

export default function WinnerCircleHashScroll() {
  useEffect(() => {
    if (window.location.hash !== "#winner-circle") return;

    const target = Array.from(
      document.querySelectorAll<HTMLElement>("[data-winner-circle-target]"),
    ).find((element) => element.getClientRects().length > 0);

    target?.scrollIntoView({ block: "start" });
  }, []);

  return null;
}

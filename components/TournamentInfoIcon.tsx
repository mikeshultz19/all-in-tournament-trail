import type { CSSProperties } from "react";

interface TournamentInfoIconProps {
  src: "/icons/calendar-deadline.svg" | "/icons/sun-safe-light.svg";
  className?: string;
}

export default function TournamentInfoIcon({ src, className = "" }: TournamentInfoIconProps) {
  const maskStyle: CSSProperties = {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
    maskSize: "contain",
  };

  return (
    <span
      aria-hidden="true"
      data-icon-src={src}
      className={`block shrink-0 bg-current ${className}`}
      style={maskStyle}
    />
  );
}

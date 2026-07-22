type SiteCraftMarkProps = {
  className?: string;
  size?: number;
};

export default function SiteCraftMark({
  className,
  size = 28,
}: SiteCraftMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      focusable="false"
      height={size}
      viewBox="0 0 32 32"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 2.75 27.5 9.4v13.2L16 29.25 4.5 22.6V9.4L16 2.75Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M20.8 10.15c-1.15-1.1-2.65-1.65-4.5-1.65-2.75 0-4.65 1.35-4.65 3.35 0 4.45 8.7 2.25 8.7 6.65 0 2.35-2.1 4-5.15 4-1.85 0-3.45-.6-4.65-1.8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
      <path
        d="M21.55 12.15a6 6 0 1 0-.15 7.9"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  );
}

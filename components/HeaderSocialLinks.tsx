import { SOCIAL_LINKS } from "@/config/social-links";

function FacebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.87.24-1.46 1.49-1.46H16.7V5.02c-.38-.05-1.7-.14-3.22-.14-3.18 0-5.36 1.94-5.36 5.5V11H5.6v3h2.52v8h5.38Z" />
    </svg>
  );
}

function InstagramIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.25" cy="6.75" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const socialLinks = [
  {
    ...SOCIAL_LINKS.facebook,
    Icon: FacebookIcon,
  },
  {
    ...SOCIAL_LINKS.instagram,
    Icon: InstagramIcon,
  },
] as const;

type HeaderSocialLinksProps = {
  className?: string;
  linkClassName?: string;
};

export default function HeaderSocialLinks({
  className = "",
  linkClassName = "",
}: HeaderSocialLinksProps) {
  return (
    <div className={`flex items-center ${className}`.trim()}>
      {socialLinks.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={`inline-flex cursor-pointer items-center justify-center transition duration-200 ${
            label === "Facebook"
              ? "text-[#1877F2] hover:text-[#4593f5]"
              : "text-[#E4405F] hover:text-[#f05c76]"
          } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 ${linkClassName}`.trim()}
        >
          <Icon className="h-[19px] w-[19px]" />
        </a>
      ))}
    </div>
  );
}

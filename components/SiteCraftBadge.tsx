import Image from "next/image";
import Link from "next/link";

export default function SiteCraftBadge() {
  return (
    <Link
      className="inline-block opacity-70 transition-[opacity,transform,filter] duration-200 hover:-translate-y-0.5 hover:opacity-100 hover:drop-shadow-[0_0_6px_rgba(212,160,23,0.3)] focus-visible:-translate-y-0.5 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 focus-visible:drop-shadow-[0_0_6px_rgba(212,160,23,0.3)] motion-reduce:transform-none"
      href="/contact"
    >
      <Image
        alt="SiteCraft Web Design"
        height={110}
        src="/brands/sitecraft.png"
        width={110}
      />
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  className?: string;
  animated?: boolean;
}

export default function Logo({
  size = "md",
  href = "/",
  className = "",
  animated = false,
}: LogoProps) {
  const sizeMap = {
    sm: { w: 40, h: 40, class: "w-10 h-10" },
    md: { w: 48, h: 48, class: "w-12 h-12" },
    lg: { w: 96, h: 96, class: "w-24 h-24" },
    xl: { w: 128, h: 128, class: "w-32 h-32" },
  };

  const dimensions = sizeMap[size];

  const logo = (
    <div
      className={`relative ${dimensions.class} ${className} ${
        animated ? "hover:scale-110 transition-transform duration-300" : ""
      }`}
    >
      <Image
        src="/ImpactClub Logo.png"
        alt="ImpactClub Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {logo}
      </Link>
    );
  }

  return logo;
}

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
    sm: { w: 60, h: 60, px: "60px", class: "w-14 h-14" },
    md: { w: 72, h: 72, px: "72px", class: "w-18 h-18" },
    lg: { w: 140, h: 140, px: "140px", class: "w-36 h-36" },
    xl: { w: 180, h: 180, px: "180px", class: "w-44 h-44" },
  };

  const dimensions = sizeMap[size];

  const logo = (
    <img
      src="/ImpactClubLogo.png"
      alt="ImpactClub Logo"
      width={dimensions.w}
      height={dimensions.h}
      className={`${dimensions.class} ${className} object-contain ${
        animated ? "hover:scale-110 transition-transform duration-300" : ""
      }`}
      style={{ display: "block" }}
    />
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

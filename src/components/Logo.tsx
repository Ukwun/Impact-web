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
    sm: { w: 52, h: 52, px: "52px", class: "w-13 h-13" },
    md: { w: 64, h: 64, px: "64px", class: "w-16 h-16" },
    lg: { w: 120, h: 120, px: "120px", class: "w-30 h-30" },
    xl: { w: 160, h: 160, px: "160px", class: "w-40 h-40" },
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

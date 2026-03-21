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
    sm: { w: 40, h: 40, px: "40px", class: "w-10 h-10" },
    md: { w: 48, h: 48, px: "48px", class: "w-12 h-12" },
    lg: { w: 96, h: 96, px: "96px", class: "w-24 h-24" },
    xl: { w: 128, h: 128, px: "128px", class: "w-32 h-32" },
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

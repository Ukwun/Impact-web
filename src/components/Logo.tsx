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
    sm: { w: 80, h: 80, px: "80px", class: "w-20 h-20" },
    md: { w: 120, h: 120, px: "120px", class: "w-32 h-32" },
    lg: { w: 160, h: 160, px: "160px", class: "w-40 h-40" },
    xl: { w: 220, h: 220, px: "220px", class: "w-56 h-56" },
  };

  const dimensions = sizeMap[size];

  const logo = (
    <img
      src="/ImpactKnowledgeLogo.png"
      alt="ImpactKnowledge Logo"
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

import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  status?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  icon: Icon,
  label,
  value,
  unit,
  gradientFrom,
  gradientTo,
  borderColor,
  status,
  trend,
  trendValue,
  className = "",
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white hover:shadow-xl transition-all duration-300 border ${borderColor} border-opacity-50 animate-fade-in cursor-pointer ${className}`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-300"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header with icon and status badge */}
        <div className="flex items-center justify-between mb-3">
          <Icon className="w-6 h-6 opacity-90" />
          {status && (
            <span className="text-xs font-bold opacity-80 uppercase tracking-wider">
              {status}
            </span>
          )}
        </div>

        {/* Label */}
        <p className="text-sm opacity-90 mb-2 font-medium">{label}</p>

        {/* Value */}
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black">{value}</p>
          {unit && <span className="text-sm opacity-75 font-semibold">{unit}</span>}
        </div>

        {/* Trend indicator */}
        {trend && trendValue && (
          <div className="mt-2 text-xs opacity-80 font-medium">
            {trend === "up" && "↑"} {trend === "down" && "↓"}
            {trend === "neutral" && "→"} {trendValue}
          </div>
        )}
      </div>
    </div>
  );
};

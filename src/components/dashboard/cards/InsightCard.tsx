import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface InsightCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  children,
  className = "",
  stats,
}) => {
  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          {Icon && <Icon className="w-6 h-6 text-primary-400 mt-1 flex-shrink-0" />}
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Stats grid (optional) */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-dark-600">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <p className="text-xs text-gray-400 font-medium mb-1">{stat.label}</p>
              <p className="text-lg font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="text-gray-300">{children}</div>
    </Card>
  );
};

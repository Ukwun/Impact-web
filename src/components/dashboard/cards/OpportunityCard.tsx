import React from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface OpportunityCardProps {
  title: string;
  description: string;
  category: string;
  icon?: LucideIcon;
  metadata?: {
    label: string;
    value: string;
  }[];
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  priority?: "high" | "medium" | "low";
}

const priorityStyles = {
  high: "border-l-4 border-danger-500 bg-gradient-to-r from-danger-500/10 to-transparent",
  medium: "border-l-4 border-amber-500 bg-gradient-to-r from-amber-500/10 to-transparent",
  low: "border-l-4 border-secondary-500 bg-gradient-to-r from-secondary-500/10 to-transparent",
};

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  title,
  description,
  category,
  icon: Icon,
  metadata,
  actionLabel,
  onAction,
  className = "",
  priority = "medium",
}) => {
  return (
    <Card className={`p-6 ${priorityStyles[priority]} ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          {Icon && <Icon className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-400 whitespace-nowrap">
                {category}
              </span>
              {priority === "high" && (
                <span className="text-xs font-bold text-danger-400">● NEW</span>
              )}
            </div>
            <h3 className="text-base font-bold text-white leading-tight">{title}</h3>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-300 mb-3 line-clamp-2">{description}</p>

      {/* Metadata */}
      {metadata && metadata.length > 0 && (
        <div className="flex gap-3 mb-3 flex-wrap">
          {metadata.map((item, idx) => (
            <span key={idx} className="text-xs text-gray-400 bg-dark-600/50 px-2 py-1 rounded">
              <span className="text-gray-500">{item.label}:</span>{" "}
              <span className="text-gray-300 font-semibold">{item.value}</span>
            </span>
          ))}
        </div>
      )}

      {/* Action */}
      {actionLabel && onAction && (
        <Button size="sm" variant="primary" onClick={onAction} className="w-full">
          {actionLabel}
        </Button>
      )}
    </Card>
  );
};

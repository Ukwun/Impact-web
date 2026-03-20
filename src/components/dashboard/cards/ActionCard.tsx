import React, { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ActionCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "warning" | "success";
}

const variantStyles = {
  primary: "border-l-4 border-primary-500 bg-gradient-to-r from-primary-500/10 to-transparent",
  secondary:
    "border-l-4 border-secondary-500 bg-gradient-to-r from-secondary-500/10 to-transparent",
  warning: "border-l-4 border-amber-500 bg-gradient-to-r from-amber-500/10 to-transparent",
  success: "border-l-4 border-green-500 bg-gradient-to-r from-green-500/10 to-transparent",
};

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon: Icon,
  primaryAction,
  secondaryAction,
  children,
  className = "",
  variant = "primary",
}) => {
  return (
    <Card className={`p-6 ${variantStyles[variant]} ${className}`}>
      <div className="flex gap-4">
        {Icon && (
          <div className="flex-shrink-0">
            <Icon className="w-6 h-6 text-primary-400 mt-1" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>

          {/* Description */}
          {description && <p className="text-sm text-gray-300 mb-4">{description}</p>}

          {/* Custom content */}
          {children && <div className="mb-4">{children}</div>}

          {/* Action buttons */}
          {(primaryAction || secondaryAction) && (
            <div className="flex gap-3 mt-4">
              {primaryAction && (
                <Button size="sm" variant="primary" onClick={primaryAction.onClick}>
                  {primaryAction.label}
                </Button>
              )}
              {secondaryAction && (
                <Button size="sm" variant="outline" onClick={secondaryAction.onClick}>
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

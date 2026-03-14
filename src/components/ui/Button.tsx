import { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import clsx from "clsx";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 whitespace-nowrap active:scale-95 min-h-12 touch-manipulation",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:shadow-lg hover:shadow-primary-600/50 focus:ring-primary-500",
        secondary:
          "bg-gradient-to-r from-secondary-500 to-secondary-600 text-dark-900 hover:shadow-lg hover:shadow-secondary-500/50 focus:ring-secondary-500",
        outline:
          "border-2 border-dark-500 text-gray-300 hover:border-primary-500 hover:text-primary-400 focus:ring-dark-500",
        ghost: "text-gray-400 hover:text-white hover:bg-dark-700 focus:ring-dark-500",
        danger:
          "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/50 focus:ring-red-500",
        light:
          "bg-dark-600 text-gray-200 border border-dark-500 hover:bg-dark-500 hover:border-dark-400 focus:ring-primary-500",
      },
      size: {
        xs: "px-3 py-2 text-xs font-bold",
        sm: "px-4 py-2.5 text-sm font-bold",
        md: "px-6 py-3 text-base font-bold",
        lg: "px-8 py-4 text-lg font-bold",
        xl: "px-10 py-5 text-xl font-bold",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  children: ReactNode;
  asChild?: boolean;
}

export const Button = ({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: ButtonProps) => {
  const buttonClasses = clsx(buttonVariants({ variant, size }), className);
  
  if (asChild) {
    return (
      <div className={buttonClasses} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  return (
    <button className={buttonClasses} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
};

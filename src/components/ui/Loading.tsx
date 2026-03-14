import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';

const loadingVariants = cva(
  'flex items-center justify-center',
  {
    variants: {
      size: {
        xs: 'p-1',
        sm: 'p-2',
        md: 'p-4',
        lg: 'p-8',
        xl: 'p-12',
      },
      variant: {
        default: 'text-primary-400',
        dark: 'text-dark-400',
        light: 'text-white',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

interface LoadingProps extends VariantProps<typeof loadingVariants> {
  children?: ReactNode;
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export function Loading({
  children,
  text,
  size,
  variant,
  className,
  fullScreen = false,
}: LoadingProps) {
  const content = (
    <div className={clsx(loadingVariants({ size, variant }), className)}>
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
        {text && (
          <p className="text-sm font-medium opacity-80">{text}</p>
        )}
        {children}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

// Skeleton loading components for better perceived performance
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-dark-600 rounded',
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-dark-800 rounded-lg p-6 space-y-4">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
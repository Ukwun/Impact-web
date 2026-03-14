interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "light" | "dark";
}

export const Card = ({ children, className = "", variant = "dark" }: CardProps) => {
  const baseStyles = variant === "dark" 
    ? `bg-dark-700/80 backdrop-blur-sm rounded-2xl shadow-xl border border-dark-600 hover:border-primary-500 transition-all`
    : `bg-dark-700/50 rounded-2xl shadow-md hover:shadow-xl transition-smooth border border-dark-600`;
  
  return (
    <div className={`overflow-hidden ${baseStyles} ${className}`}>
      {children}
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "light" | "dark";
}

export const Input = ({ className, variant = "dark", ...props }: InputProps) => {
  // Use classname conditions instead of template strings so Tailwind can detect the classes
  return (
    <input
      className={`
        w-full px-4 py-3 rounded-lg transition-colors focus:ring-2 focus:border-primary-500 disabled:cursor-not-allowed text-base
        ${variant === "dark" 
          ? "bg-dark-600 border-2 border-dark-500 text-gray-100 placeholder-gray-400 focus:ring-primary-500 focus:bg-dark-700 disabled:bg-dark-700"
          : "bg-dark-700/50 border-2 border-dark-600 text-gray-200 placeholder-gray-500 focus:ring-primary-500 focus:bg-dark-600 disabled:bg-dark-600"
        }
        ${className || ""}
      `}
      {...props}
    />
  );
};

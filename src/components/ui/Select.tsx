interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = ({ className, children, ...props }: SelectProps) => {
  return (
    <select
      className={`
        w-full px-4 py-3 border-2 border-gray-200 rounded-xl
        focus:ring-2 focus:ring-primary-500 focus:border-primary-500
        transition-smooth
        text-text-500 font-medium
        disabled:bg-dark-600 disabled:cursor-not-allowed
        appearance-none bg-dark-700/50 cursor-pointer text-gray-300 border-2 border-dark-600 focus:ring-primary-500 focus:border-primary-500
        ${className || ""}
      `}
      {...props}
    >
      {children}
    </select>
  );
};

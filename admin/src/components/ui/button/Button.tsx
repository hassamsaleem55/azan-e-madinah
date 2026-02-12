import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode; // Button text or content
  size?: "sm" | "md"; // Button size
  variant?: "primary" | "outline"; // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  onClick?: () => void; // Click handler
  disabled?: boolean; // Disabled state
  className?: string; // Disabled state
  type?: "button" | "submit" | "reset"; // Button type
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  type = "button",
}) => {
  // Size Classes
  const sizeClasses = {
    sm: "px-5 py-3 text-sm",
    md: "px-6 py-3.5 text-sm font-medium",
  };

  // Variant Classes
  const variantClasses = {
    primary:
      "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 hover:from-brand-600 hover:to-brand-700 active:scale-[0.98] disabled:from-brand-300 disabled:to-brand-300 disabled:shadow-none",
    outline:
      "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 ring-2 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 hover:ring-gray-400 dark:hover:bg-gray-800 dark:hover:ring-gray-600 shadow-sm hover:shadow-md active:scale-[0.98]",
  };

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2.5 rounded-xl transition-all duration-300 ${className} ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${
        disabled ? "cursor-not-allowed opacity-50 hover:shadow-none" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center transition-transform group-hover:scale-110">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center transition-transform group-hover:scale-110">{endIcon}</span>}
    </button>
  );
};

export default Button;

import { useState } from "react";

interface SwitchProps {
  label: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  color?: "blue" | "gray"; // Added prop to toggle color theme
}

const Switch: React.FC<SwitchProps> = ({
  label,
  defaultChecked = false,
  disabled = false,
  onChange,
  color = "blue", // Default to blue color
}) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  const handleToggle = () => {
    if (disabled) return;
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    if (onChange) {
      onChange(newCheckedState);
    }
  };

  const switchColors =
    color === "blue"
      ? {
          background: isChecked
            ? "bg-gradient-to-r from-brand-500 to-brand-600 shadow-lg shadow-brand-500/30"
            : "bg-gray-200 dark:bg-gray-700 shadow-sm", // Blue version
          knob: isChecked
            ? "translate-x-full bg-white shadow-xl scale-110"
            : "translate-x-0 bg-white shadow-md",
        }
      : {
          background: isChecked
            ? "bg-gradient-to-r from-gray-700 to-gray-800 dark:from-gray-600 dark:to-gray-700 shadow-lg"
            : "bg-gray-200 dark:bg-gray-700 shadow-sm", // Gray version
          knob: isChecked
            ? "translate-x-full bg-white shadow-xl scale-110"
            : "translate-x-0 bg-white shadow-md",
        };

  return (
    <label
      className={`flex cursor-pointer select-none items-center gap-4 text-sm font-semibold group ${
        disabled ? "text-gray-400 cursor-not-allowed" : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
      }`}
      onClick={handleToggle} // Toggle when the label itself is clicked
    >
      <div className="relative">
        <div
          className={`block transition-all duration-300 ease-out h-7 w-12 rounded-full border-2 ${
            disabled
              ? "bg-gray-100 pointer-events-none dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              : isChecked 
                ? `${switchColors.background} border-transparent`
                : `${switchColors.background} border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500`
          }`}
        ></div>
        <div
          className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full transition-all duration-300 ease-out transform ${switchColors.knob}`}
        ></div>
      </div>
      <span className="transition-colors duration-300">{label}</span>
    </label>
  );
};

export default Switch;

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200/50 bg-white dark:border-gray-800/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 ${className}`}
    >
      {/* Card Header */}
      <div className="px-6 py-6 bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-800/30 dark:to-transparent rounded-t-2xl">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
          {title}
        </h3>
        {desc && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {desc}
          </p>
        )}
      </div>

      {/* Card Body */}
      <div className="p-6 border-t border-gray-100/50 dark:border-gray-800/50">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;

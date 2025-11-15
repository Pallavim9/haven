"use client";

interface HavenLogoProps {
  size?: "sm" | "md" | "lg";
  showAnimation?: boolean;
}

export default function HavenLogo({ size = "md", showAnimation = true }: HavenLogoProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const pinSizes = {
    sm: "w-4 h-4 -top-0.5 -right-0.5",
    md: "w-6 h-6 -top-1 -right-1",
    lg: "w-8 h-8 -top-1.5 -right-1.5",
  };

  const pinIconSizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className="relative">
      {/* Speech bubble / Location pin shape */}
      <div className={`${sizeClasses[size]} bg-indigo-400 dark:bg-indigo-500 rounded-full flex items-center justify-center relative`}>
        {/* House icon */}
        <svg
          className={`${iconSizes[size]} text-white`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        {/* Location pin overlay */}
        <div className={`absolute ${pinSizes[size]} bg-indigo-600 dark:bg-indigo-700 rounded-full flex items-center justify-center`}>
          <svg
            className={`${pinIconSizes[size]} text-white`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {/* Ping effect dots */}
        {showAnimation && (
          <div className="absolute inset-0 rounded-full border-2 border-indigo-400 dark:border-indigo-500 animate-ping opacity-75"></div>
        )}
      </div>
    </div>
  );
}


import { useLocation } from "wouter";

interface OraclioLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  clickable?: boolean;
}

export default function OraclioLogo({ className = "", size = "md", showText = true, clickable = true }: OraclioLogoProps) {
  const [, setLocation] = useLocation();
  
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl"
  };

  // SVG path data for the Oraclio logo shape
  const starPath = "M50 0 C75 0 100 25 100 50 C100 75 75 100 50 100 C25 100 0 75 0 50 C0 25 25 0 50 0 Z M50 20 C65 20 80 35 80 50 C80 65 65 80 50 80 C35 80 20 65 20 50 C20 35 35 20 50 20 Z";

  const handleClick = () => {
    if (clickable) {
      setLocation("/");
    }
  };

  return (
    <div 
      className={`flex items-center space-x-2 ${clickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
      onClick={handleClick}
    >
      {showText && (
        <span className={`font-bold text-gray-900 dark:text-white ${textSizeClasses[size]} tracking-tight`}>
          Oracli
        </span>
      )}

      {/* The stylized 'O' as an SVG representing the last 'o' in "Oraclio" */}
      <svg
        className={`${sizeClasses[size]} text-blue-500 transform transition-transform duration-300 hover:rotate-12`}
        viewBox="0 0 100 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Path for the main fihankra symbol shape */}
        <path d={starPath} />

        {/* Rotated square (diamond) with rounded corners in the center */}
        <rect
          x="35"
          y="35"
          width="30"
          height="30"
          rx="5"
          ry="5"
          fill="#60A5FA" // Tailwind's blue-400 for the inner diamond
          transform="rotate(45 50 50)" // Rotate by 45 degrees around the center
        />
      </svg>
    </div>
  );
}
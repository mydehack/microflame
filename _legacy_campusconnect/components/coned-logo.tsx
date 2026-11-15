import React from "react";
import Link from "next/link";

interface ConEdLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  linkToHome?: boolean;
  className?: string;
}

export function ConEdLogo({
  size = "md",
  showTagline = true,
  linkToHome = true,
  className = "",
}: ConEdLogoProps) {
  const capSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-11 h-11",
    xl: "w-16 h-16",
  };

  const textSizes = {
    sm: "text-base tracking-tight",
    md: "text-lg tracking-tight",
    lg: "text-2xl tracking-tight",
    xl: "text-3xl tracking-tight",
  };

  const taglineSizes = {
    sm: "text-[9px]",
    md: "text-[10px]",
    lg: "text-xs",
    xl: "text-sm",
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Emerald Graduation Cap Minimal Geometric Mark */}
      <div
        className={`relative ${capSizes[size]} shrink-0 rounded-xl bg-gradient-to-br from-[#131F1A] to-[#18251F] border border-[#00E69A]/40 p-1.5 flex items-center justify-center shadow-[0_0_15px_rgba(0,230,154,0.25)] group`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-[#00E69A] transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(0,230,154,0.6)]"
        >
          {/* Diamond top plate of graduation cap */}
          <path
            d="M12 3L2 8.5L12 14L22 8.5L12 3Z"
            fill="url(#cap-grad)"
            stroke="#00E69A"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* Lower skull cap base */}
          <path
            d="M6 11V16.5C6 18.5 8.68629 20.5 12 20.5C15.3137 20.5 18 18.5 18 16.5V11"
            stroke="#00E69A"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          {/* Tassel line & pearl drop */}
          <path
            d="M20 9.5V16L21.5 17.5"
            stroke="#67F5B8"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="21.5" cy="18" r="1" fill="#00E69A" />
          <defs>
            <linearGradient id="cap-grad" x1="2" y1="3" x2="22" y2="14" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00E69A" stopOpacity="0.4" />
              <stop stopColor="#008F62" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-extrabold text-[#F4FFF9] leading-none ${textSizes[size]}`}
            style={{ letterSpacing: "-0.04em" }}
          >
            CON<span className="text-[#00E69A]">-ED</span>
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00E69A] shadow-[0_0_6px_#00E69A]" />
        </div>
        {showTagline && (
          <span
            className={`text-[#71857A] font-medium tracking-wider uppercase mt-0.5 leading-none ${taglineSizes[size]}`}
          >
            Connect • Learn • Grow
          </span>
        )}
      </div>
    </div>
  );

  if (linkToHome) {
    return (
      <Link href="/home" aria-label="CON-ED Home" className="no-underline">
        {content}
      </Link>
    );
  }

  return content;
}

export { ConEdLogo as ConedLogo };
export default ConEdLogo;

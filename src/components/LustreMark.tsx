interface LustreMarkProps {
  className?: string;
}

/**
 * Lustre logo: a dithered iridescent diamond.
 */
export function LustreMark({ className }: LustreMarkProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="lustre-iris" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.78 0.16 220)" />
          <stop offset="50%" stopColor="oklch(0.74 0.18 295)" />
          <stop offset="100%" stopColor="oklch(0.82 0.14 165)" />
        </linearGradient>
        <pattern id="lustre-dither" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" fill="white" opacity="0.85" />
          <rect x="1" y="1" width="1" height="1" fill="white" opacity="0.5" />
        </pattern>
        <mask id="lustre-mask">
          <rect width="32" height="32" fill="url(#lustre-dither)" />
        </mask>
      </defs>
      <rect width="32" height="32" fill="oklch(0.13 0.02 270)" />
      <g mask="url(#lustre-mask)">
        <polygon points="16,3 29,16 16,29 3,16" fill="url(#lustre-iris)" />
      </g>
      <polygon
        points="16,3 29,16 16,29 3,16"
        fill="none"
        stroke="oklch(0.96 0.01 250)"
        strokeWidth="0.5"
        strokeOpacity="0.8"
      />
      <polygon points="16,3 22,16 16,29 10,16" fill="oklch(0.96 0.01 250)" fillOpacity="0.15" />
    </svg>
  );
}

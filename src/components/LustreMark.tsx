interface VaultMarkProps {
  className?: string;
}

/**
 * VAULT logo: a dithered iridescent vault/safe glyph — concentric squares
 * with a centered iris jewel.
 */
export function VaultMark({ className }: VaultMarkProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="vault-iris" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.78 0.16 220)" />
          <stop offset="50%" stopColor="oklch(0.74 0.18 295)" />
          <stop offset="100%" stopColor="oklch(0.82 0.14 165)" />
        </linearGradient>
        <pattern id="vault-dither" width="2" height="2" patternUnits="userSpaceOnUse">
          <rect width="1" height="1" fill="white" opacity="0.9" />
          <rect x="1" y="1" width="1" height="1" fill="white" opacity="0.55" />
        </pattern>
        <mask id="vault-mask">
          <rect width="32" height="32" fill="url(#vault-dither)" />
        </mask>
      </defs>
      {/* Outer vault body */}
      <rect width="32" height="32" fill="oklch(0.13 0.02 270)" />
      <rect x="2" y="2" width="28" height="28" fill="none" stroke="oklch(0.96 0.01 250)" strokeOpacity="0.4" strokeWidth="0.5" />
      <rect x="5" y="5" width="22" height="22" fill="none" stroke="oklch(0.96 0.01 250)" strokeOpacity="0.25" strokeWidth="0.5" />
      {/* Iridescent dial */}
      <g mask="url(#vault-mask)">
        <circle cx="16" cy="16" r="8" fill="url(#vault-iris)" />
      </g>
      <circle cx="16" cy="16" r="8" fill="none" stroke="oklch(0.96 0.01 250)" strokeOpacity="0.7" strokeWidth="0.5" />
      <circle cx="16" cy="16" r="2.2" fill="oklch(0.96 0.01 250)" fillOpacity="0.95" />
      {/* Hinges */}
      <rect x="0.5" y="13.5" width="2" height="1" fill="oklch(0.96 0.01 250)" fillOpacity="0.4" />
      <rect x="0.5" y="17.5" width="2" height="1" fill="oklch(0.96 0.01 250)" fillOpacity="0.4" />
      {/* Bolts */}
      <circle cx="6" cy="6" r="0.6" fill="oklch(0.96 0.01 250)" fillOpacity="0.5" />
      <circle cx="26" cy="6" r="0.6" fill="oklch(0.96 0.01 250)" fillOpacity="0.5" />
      <circle cx="6" cy="26" r="0.6" fill="oklch(0.96 0.01 250)" fillOpacity="0.5" />
      <circle cx="26" cy="26" r="0.6" fill="oklch(0.96 0.01 250)" fillOpacity="0.5" />
    </svg>
  );
}

// Backwards-compat export
export const LustreMark = VaultMark;

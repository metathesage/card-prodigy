import { useMemo } from "react";
import type { PriceHistoryPoint } from "@/lib/cards/types";

interface PriceChartProps {
  data: PriceHistoryPoint[];
  height?: number;
  /** "iris" (cyan/violet/mint) | "bull" (green) | "bear" (red) */
  tone?: "iris" | "bull" | "bear";
  showGrid?: boolean;
  showAxis?: boolean;
}

export function PriceChart({
  data,
  height = 220,
  tone = "iris",
  showGrid = true,
  showAxis = true,
}: PriceChartProps) {
  const { path, areaPath, min, max, dots } = useMemo(() => {
    if (data.length === 0) {
      return { path: "", areaPath: "", min: 0, max: 0, dots: [] as Array<{ x: number; y: number }> };
    }
    const w = 1000;
    const h = 300;
    const pad = 12;
    const prices = data.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1 || 1)) * (w - pad * 2) + pad;
      const y = h - pad - ((d.price - min) / range) * (h - pad * 2);
      return { x, y };
    });

    const path = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(" ");
    const areaPath = `${path} L${points[points.length - 1].x.toFixed(2)},${h - pad} L${points[0].x.toFixed(2)},${h - pad} Z`;

    return { path, areaPath, min, max, dots: points };
  }, [data]);

  const strokeColor =
    tone === "bull" ? "var(--bull)" : tone === "bear" ? "var(--bear)" : "var(--iris)";
  const fillColor =
    tone === "bull" ? "var(--bull)" : tone === "bear" ? "var(--bear)" : "var(--iris)";

  const gradId = useMemo(() => `g-${Math.random().toString(36).slice(2, 9)}`, []);

  if (data.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-muted-foreground text-xs font-mono"
      >
        NO DATA
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <svg
        viewBox="0 0 1000 300"
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0" />
          </linearGradient>
          <pattern id={`${gradId}-dither`} width="3" height="3" patternUnits="userSpaceOnUse">
            <rect width="1" height="1" fill={fillColor} opacity="0.4" />
            <rect x="2" y="2" width="1" height="1" fill={fillColor} opacity="0.25" />
          </pattern>
        </defs>

        {showGrid && (
          <g stroke="currentColor" className="text-foreground/5">
            {[0.25, 0.5, 0.75].map((p) => (
              <line key={p} x1="12" x2="988" y1={300 * p} y2={300 * p} strokeDasharray="2 6" />
            ))}
          </g>
        )}

        {/* Dithered area */}
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={areaPath} fill={`url(#${gradId}-dither)`} opacity="0.6" />

        {/* Stroke */}
        <path d={path} fill="none" stroke={strokeColor} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />

        {/* End dot */}
        {dots.length > 0 && (
          <g>
            <circle
              cx={dots[dots.length - 1].x}
              cy={dots[dots.length - 1].y}
              r="6"
              fill={strokeColor}
              opacity="0.2"
            >
              <animate attributeName="r" values="4;10;4" dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0;0.4" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx={dots[dots.length - 1].x} cy={dots[dots.length - 1].y} r="3" fill={strokeColor} />
          </g>
        )}
      </svg>
      {showAxis && (
        <div className="flex justify-between mt-1 text-[10px] font-mono text-muted-foreground tracking-wider uppercase">
          <span>${min.toFixed(2)}</span>
          <span>{data[0]?.date}</span>
          <span>{data[data.length - 1]?.date}</span>
          <span>${max.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

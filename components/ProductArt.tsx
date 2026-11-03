import type { ProductId } from "../lib/catalog";

// Flat drawings of the four products, in each product's own colour (the colour the cart's chart
// uses too). Decorative: the product's name is always next to it.
export function ProductArt({ id, color }: { id: ProductId; color: string }) {
  return (
    <svg className="art" viewBox="0 0 120 90" aria-hidden="true" focusable="false">
      {id === "tote" && (
        <g>
          <path
            d="M44 34 C44 14 56 14 56 34 M64 34 C64 14 76 14 76 34"
            fill="none"
            stroke="#1b1a17"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M32 34 H88 L85 82 H35 Z" fill={color} />
          <rect x="49" y="50" width="22" height="15" rx="2" fill="#ffffff" opacity="0.9" />
        </g>
      )}
      {id === "mug" && (
        <g>
          <path
            d="M50 14 c-4 6 4 8 0 14 M62 12 c-4 6 4 8 0 14"
            fill="none"
            stroke="#1b1a17"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path d="M80 44 h6 a10 10 0 0 1 0 20 h-6" fill="none" stroke={color} strokeWidth="7" />
          <path d="M36 34 H82 V70 a10 10 0 0 1 -10 10 H46 a10 10 0 0 1 -10 -10 Z" fill={color} />
          <rect x="36" y="34" width="46" height="7" fill="#1b1a17" opacity="0.15" />
        </g>
      )}
      {id === "apron" && (
        <g>
          <path
            d="M46 10 L50 26 M74 10 L70 26"
            stroke="#1b1a17"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M48 26 H72 L74 40 C82 40 88 44 90 48 L84 82 H36 L30 48 C32 44 38 40 46 40 Z"
            fill={color}
          />
          <path
            d="M30 46 L16 50 M90 46 L104 50"
            stroke="#1b1a17"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect x="48" y="56" width="24" height="14" rx="3" fill="#ffffff" opacity="0.85" />
        </g>
      )}
      {id === "pin" && (
        <g>
          <path d="M60 46 C46 22 22 26 28 44 C32 56 50 54 60 46 Z" fill={color} />
          <path d="M60 46 C74 22 98 26 92 44 C88 56 70 54 60 46 Z" fill={color} />
          <path d="M60 46 C50 58 38 66 44 74 C50 80 58 66 60 46 Z" fill={color} opacity="0.75" />
          <path d="M60 46 C70 58 82 66 76 74 C70 80 62 66 60 46 Z" fill={color} opacity="0.75" />
          <rect x="57.5" y="36" width="5" height="34" rx="2.5" fill="#1b1a17" />
        </g>
      )}
    </svg>
  );
}

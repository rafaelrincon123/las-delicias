// Ilustraciones ricas para los 4 tiles del Home. Cada arte es un SVG 96×96
// con relleno multi-color pensado para verse como una pequeña imagen, no
// como un icono de línea. Diseñadas para asentarse sobre el gradiente del
// tile sin necesitar el "orb" circular.

import React from "react";

type Props = { size?: number; className?: string };

const svgBase = (size = 96): React.SVGAttributes<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 96 96",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
});

/* ─── Actividades: portapapeles con checklist ──────────────────────────── */
export const ArtActividades = ({ size, className }: Props) => (
  <svg {...svgBase(size)} className={className} aria-hidden="true">
    {/* Sombra */}
    <ellipse cx="48" cy="86" rx="30" ry="4" fill="#000" opacity="0.14" />
    {/* Portapapeles (madera) */}
    <rect x="18" y="14" width="60" height="70" rx="8" fill="#8B5A2B" />
    <rect x="18" y="14" width="60" height="70" rx="8" fill="url(#actGrad)" />
    {/* Papel */}
    <rect x="24" y="22" width="48" height="58" rx="4" fill="#FFF8ED" />
    <rect x="24" y="22" width="48" height="58" rx="4" fill="url(#actPaper)" />
    {/* Clip metálico */}
    <rect x="36" y="10" width="24" height="10" rx="3" fill="#4A3820" />
    <rect x="38" y="8" width="20" height="8" rx="2" fill="#7A5A34" />
    {/* Check 1 (hecho) */}
    <circle cx="33" cy="36" r="4.5" fill="#4CA45A" />
    <path d="M30.5 36l2 2 3.5-3.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <rect x="41" y="34.5" width="26" height="3" rx="1.5" fill="#C9A87A" />
    {/* Check 2 (hecho) */}
    <circle cx="33" cy="50" r="4.5" fill="#4CA45A" />
    <path d="M30.5 50l2 2 3.5-3.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <rect x="41" y="48.5" width="22" height="3" rx="1.5" fill="#C9A87A" />
    {/* Check 3 (pendiente) */}
    <circle cx="33" cy="64" r="4.5" fill="none" stroke="#B08A5A" strokeWidth="1.6" />
    <rect x="41" y="62.5" width="20" height="3" rx="1.5" fill="#D9BD94" />
    <defs>
      <linearGradient id="actGrad" x1="18" y1="14" x2="78" y2="84" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
        <stop offset="1" stopColor="#000" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id="actPaper" x1="24" y1="22" x2="72" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
        <stop offset="1" stopColor="#EDD9B5" stopOpacity="0.4" />
      </linearGradient>
    </defs>
  </svg>
);

/* ─── Hato: cara de vaca ──────────────────────────────────────────────── */
export const ArtHato = ({ size, className }: Props) => (
  <svg {...svgBase(size)} className={className} aria-hidden="true">
    {/* Sombra */}
    <ellipse cx="48" cy="86" rx="30" ry="4" fill="#000" opacity="0.14" />
    {/* Cuernos */}
    <path d="M22 34c-3-4-4-9-2-13 3 2 5 6 6 10z" fill="#EEE0C5" stroke="#8B6A3A" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M74 34c3-4 4-9 2-13-3 2-5 6-6 10z" fill="#EEE0C5" stroke="#8B6A3A" strokeWidth="1.2" strokeLinejoin="round" />
    {/* Orejas */}
    <ellipse cx="22" cy="42" rx="9" ry="6" fill="#F5CBA0" transform="rotate(-20 22 42)" />
    <ellipse cx="74" cy="42" rx="9" ry="6" fill="#F5CBA0" transform="rotate(20 74 42)" />
    {/* Cabeza */}
    <path d="M24 50c0-11 10-20 24-20s24 9 24 20v6c0 12-11 20-24 20s-24-8-24-20z" fill="#FFF6E4" />
    {/* Mancha */}
    <path d="M30 42c2-6 8-9 14-8-3 5-8 8-14 8z" fill="#3A2A18" opacity="0.9" />
    <path d="M62 66c5 1 10-1 12-5-3-1-7 0-10 2z" fill="#3A2A18" opacity="0.85" />
    {/* Ojos */}
    <ellipse cx="38" cy="52" rx="2.4" ry="3" fill="#1E1610" />
    <ellipse cx="58" cy="52" rx="2.4" ry="3" fill="#1E1610" />
    <circle cx="37.2" cy="51" r="0.8" fill="#fff" />
    <circle cx="57.2" cy="51" r="0.8" fill="#fff" />
    {/* Hocico */}
    <ellipse cx="48" cy="66" rx="14" ry="9" fill="#F6B6A6" />
    <ellipse cx="48" cy="66" rx="14" ry="9" fill="url(#hatoMuz)" />
    <ellipse cx="42" cy="66" rx="1.6" ry="2.2" fill="#5A3020" />
    <ellipse cx="54" cy="66" rx="1.6" ry="2.2" fill="#5A3020" />
    {/* Boca */}
    <path d="M44 71c1.5 1.5 5 1.5 6 0" stroke="#8A4030" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    <defs>
      <linearGradient id="hatoMuz" x1="34" y1="58" x2="62" y2="74" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
        <stop offset="1" stopColor="#B06858" stopOpacity="0.3" />
      </linearGradient>
    </defs>
  </svg>
);

/* ─── Gastos: billetera con billete y moneda ──────────────────────────── */
export const ArtGastos = ({ size, className }: Props) => (
  <svg {...svgBase(size)} className={className} aria-hidden="true">
    {/* Sombra */}
    <ellipse cx="48" cy="86" rx="30" ry="4" fill="#000" opacity="0.14" />
    {/* Billete asomando */}
    <rect x="28" y="24" width="42" height="24" rx="3" fill="#8DC98E" />
    <rect x="28" y="24" width="42" height="24" rx="3" fill="url(#gasBill)" />
    <circle cx="49" cy="36" r="5" fill="none" stroke="#3A6B3D" strokeWidth="1.4" />
    <text x="49" y="39.5" textAnchor="middle" fontSize="7" fontFamily="ui-sans-serif, system-ui" fontWeight="700" fill="#3A6B3D">$</text>
    <path d="M33 30h4M63 30h4M33 42h4M63 42h4" stroke="#3A6B3D" strokeWidth="1.2" strokeLinecap="round" />
    {/* Billetera */}
    <path d="M14 42c0-4 3-7 7-7h54c4 0 7 3 7 7v28c0 4-3 7-7 7H21c-4 0-7-3-7-7z" fill="#7A4E28" />
    <path d="M14 42c0-4 3-7 7-7h54c4 0 7 3 7 7v28c0 4-3 7-7 7H21c-4 0-7-3-7-7z" fill="url(#gasWallet)" />
    {/* Solapa */}
    <path d="M14 50h68v6H14z" fill="#5A3818" opacity="0.55" />
    {/* Broche */}
    <circle cx="66" cy="58" r="4.5" fill="#E7C46B" stroke="#8A6520" strokeWidth="1.2" />
    <circle cx="66" cy="58" r="1.5" fill="#8A6520" />
    {/* Moneda flotando */}
    <circle cx="72" cy="24" r="9" fill="#F4CE5C" />
    <circle cx="72" cy="24" r="9" fill="url(#gasCoin)" />
    <circle cx="72" cy="24" r="7" fill="none" stroke="#B58620" strokeWidth="1" />
    <text x="72" y="27" textAnchor="middle" fontSize="9" fontFamily="ui-sans-serif, system-ui" fontWeight="800" fill="#8A6520">$</text>
    <defs>
      <linearGradient id="gasBill" x1="28" y1="24" x2="70" y2="48" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#fff" stopOpacity="0.4" />
        <stop offset="1" stopColor="#000" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id="gasWallet" x1="14" y1="35" x2="82" y2="77" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
        <stop offset="1" stopColor="#000" stopOpacity="0.2" />
      </linearGradient>
      <radialGradient id="gasCoin" cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
        <stop offset="1" stopColor="#B58620" stopOpacity="0.35" />
      </radialGradient>
    </defs>
  </svg>
);

/* ─── Mi operación: retrato con estrella/logro ────────────────────────── */
export const ArtMi = ({ size, className }: Props) => (
  <svg {...svgBase(size)} className={className} aria-hidden="true">
    {/* Sombra */}
    <ellipse cx="48" cy="86" rx="30" ry="4" fill="#000" opacity="0.14" />
    {/* Círculo de fondo */}
    <circle cx="48" cy="48" r="34" fill="#2E5F3A" />
    <circle cx="48" cy="48" r="34" fill="url(#miBg)" />
    {/* Estrella detrás */}
    <path d="M70 28l1.6 4.4 4.6.4-3.5 3 1 4.4L70 37.8 66.3 40.2l1-4.4-3.5-3 4.6-.4z" fill="#FFD86B" />
    {/* Cabeza */}
    <circle cx="48" cy="42" r="12" fill="#F5CBA0" />
    <circle cx="48" cy="42" r="12" fill="url(#miHead)" />
    {/* Cuerpo/torso */}
    <path d="M28 78c0-11 9-20 20-20s20 9 20 20z" fill="#F5CBA0" />
    <path d="M28 78c0-11 9-20 20-20s20 9 20 20z" fill="url(#miHead)" />
    {/* Camisa */}
    <path d="M30 78c0-9 8-16 18-16s18 7 18 16z" fill="#E4A46A" />
    {/* Sombra facial */}
    <path d="M40 44c1 3 4 5 8 5s7-2 8-5c-1 4-4 7-8 7s-7-3-8-7z" fill="#B0704A" opacity="0.5" />
    <defs>
      <radialGradient id="miBg" cx="0.3" cy="0.25" r="0.9">
        <stop offset="0" stopColor="#fff" stopOpacity="0.25" />
        <stop offset="1" stopColor="#000" stopOpacity="0.15" />
      </radialGradient>
      <linearGradient id="miHead" x1="36" y1="30" x2="60" y2="78" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
        <stop offset="1" stopColor="#B0704A" stopOpacity="0.35" />
      </linearGradient>
    </defs>
  </svg>
);

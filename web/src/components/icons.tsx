// Minimalist line icons — 16×16 viewBox, 1.5 stroke
import React from "react";

type Props = { className?: string; size?: number };

const base = (size: number = 16): React.SVGAttributes<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const IconPanel = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);

export const IconCow = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M4 10c0-2 1.5-4 4-4h8c2.5 0 4 2 4 4v3a5 5 0 0 1-5 5h-6a5 5 0 0 1-5-5z" />
    <path d="M8 14h.01M16 14h.01" />
    <path d="M10 18v2M14 18v2" />
    <path d="M5 6l-2-2M19 6l2-2" />
  </svg>
);

export const IconPasture = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M3 20h18" />
    <path d="M5 20c0-3 1-6 2-9M8 20c0-4 1-8 2-11M12 20V6M15 20c-.5-4-1-7-2-10M18 20c-.5-3 0-6 1-9" />
  </svg>
);

export const IconHealth = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M8 4h8l-2 5h3l-8 11 2-8H8z" />
  </svg>
);

export const IconRepro = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="7" />
    <path d="M12 5v14M5 12h14" strokeDasharray="2 2" opacity="0.4" />
    <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
  </svg>
);

export const IconMilk = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M9 3h6l-1 3c1.5.6 2.5 2 2.5 3.7V19a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2V9.7c0-1.7 1-3.1 2.5-3.7z" />
    <path d="M9 12h6" />
  </svg>
);

export const IconMoney = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="6" width="18" height="12" rx="1.5" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M6 9h.01M18 15h.01" />
  </svg>
);

export const IconPlus = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconArrowUp = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M7 14l5-5 5 5" />
  </svg>
);

export const IconArrowDown = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M7 10l5 5 5-5" />
  </svg>
);

export const IconCalendar = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <rect x="3" y="5" width="18" height="16" rx="1.5" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

export const IconRefresh = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export const IconTask = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M8 12l3 3 5-6" />
  </svg>
);

export const IconBox = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M3 8l9-5 9 5v8l-9 5-9-5z" />
    <path d="M3 8l9 5 9-5" />
    <path d="M12 13v8" />
  </svg>
);

export const IconUser = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const IconLock = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
);

export const IconLogout = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
    <path d="M10 17l-5-5 5-5" />
    <path d="M15 12H5" />
  </svg>
);

export const IconCheck = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M5 13l4 4L19 7" />
  </svg>
);

export const IconAlert = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3l10 18H2z" />
    <path d="M12 10v5M12 18h.01" />
  </svg>
);

export const IconMenu = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const IconClose = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M6 6l12 12M18 6l-12 12" />
  </svg>
);

export const IconDots = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </svg>
);

export const IconHome = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />
  </svg>
);

export const IconBell = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
);

export const IconSparkles = ({ className, size }: Props) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z" />
    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
  </svg>
);

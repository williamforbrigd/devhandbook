import React from 'react'

/**
 * Stroke-based 24x24 icon set, matching the Lasso/Lucide style used by the
 * design system. Add new icons here as needed.
 */

const PATHS: Record<string, React.ReactNode> = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  bookOpen: <><path d="M2 4h7a3 3 0 0 1 3 3v13" /><path d="M22 4h-7a3 3 0 0 0-3 3v13" /><path d="M2 4v15h7a3 3 0 0 1 3 3 3 3 0 0 1 3-3h7V4" /></>,
  home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10.5V20h14v-9.5" /></>,
  filter: <path d="M22 3H2l8 9.5V19l4 2v-8.5z" />,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></>,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  arrowRight: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
  menu: <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>,
  x: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
  moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m5 5 1.4 1.4" /><path d="m17.6 17.6 1.4 1.4" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m5 19 1.4-1.4" /><path d="m17.6 6.4 1.4-1.4" /></>,
  monitor: <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /></>,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
  external: <><path d="M15 3h6v6" /><path d="m10 14 11-11" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></>,
  check: <path d="m5 13 4 4 10-10" />,
}

export type IconName = keyof typeof PATHS | string

export function Icon({
  name,
  size = 18,
  ...rest
}: { name: IconName; size?: number } & React.SVGProps<SVGSVGElement>): React.JSX.Element | null {
  const paths = PATHS[name]
  if (!paths) return null
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths}
    </svg>
  )
}

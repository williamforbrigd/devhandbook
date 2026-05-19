import React from 'react'

/** Small rounded chip — used for expertises, tags, taxonomy. */
export function Pill({
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>): React.JSX.Element {
  return (
    <span className="hb-pill" {...rest}>
      {children}
    </span>
  )
}

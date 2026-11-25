import type { ReactNode } from "react"
import { cn } from "../../lib/utils"

interface SectionProps {
  id: string
  title: string
  // Right side of the heading row: a count, a toggle, a link.
  aside?: ReactNode
  children: ReactNode
  className?: string
}

// One heading style for every block on the film page: a plain h2, no eyebrow. scroll-mt keeps an
// anchored heading (#trailer, #reviews) clear of the sticky 64px nav.
export function Section({ id, title, aside, children, className }: SectionProps) {
  return (
    <section aria-labelledby={`${id}-heading`} id={id} className={cn("scroll-mt-24", className)}>
      <div className="mb-5 flex min-w-0 flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id={`${id}-heading`} className="text-balance text-heading-sm font-bold text-ink">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

// The bordered, lifted surface the home page uses for cards: for the sidebar panels.
export const panel = "rounded-2xl border border-hairline-soft bg-hairline p-5 sm:p-6"

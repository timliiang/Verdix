import { useRef, type ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { initials } from "../../lib/format"
import { profileUrl } from "../../lib/tmdbImage"
import type { CastCredit, CrewRole, CrewRoleKey } from "../../lib/movieTypes"

// A face or, without a headshot, the person's initials on the same 2:3 tile, so the rail never
// shows a broken image or an anonymous silhouette.
function Headshot({ name, path }: { name: string; path: string | null }) {
  return (
    <div className="aspect-[2/3] overflow-hidden rounded-media bg-surface-cool">
      {path ? (
        <img src={profileUrl(path)} alt="" width={185} height={278} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true" className="grid h-full place-items-center text-heading-sm font-semibold text-slate">
          {initials(name)}
        </span>
      )}
    </div>
  )
}

// Top-billed cast as a swipeable snap rail. The scroller is focusable (tabIndex=0) and named, so
// keyboard users can scroll it with the arrow keys: nothing inside it is a tab stop.
// From sm, previous/next buttons page the rail for mouse users (a wheel scrolls vertically); touch
// screens swipe instead, so the buttons stay hidden there.
export function CastRail({ cast }: { cast: CastCredit[] }) {
  const ref = useRef<HTMLOListElement>(null)
  const page = (direction: 1 | -1) => {
    const rail = ref.current
    if (!rail) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="hidden justify-end gap-2 sm:flex">
        <RailButton label="Scroll cast back" onClick={() => page(-1)}>
          <ChevronLeft className="size-4" aria-hidden="true" />
        </RailButton>
        <RailButton label="Scroll cast forward" onClick={() => page(1)}>
          <ChevronRight className="size-4" aria-hidden="true" />
        </RailButton>
      </div>
    <ol
      ref={ref}
      tabIndex={0}
      aria-label="Cast"
      className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight sm:-mx-1 sm:scroll-px-1 sm:px-1"
    >
      {cast.map((c) => (
        <li key={`${c.id}-${c.character}`} className="w-28 shrink-0 snap-start sm:w-32">
          <Headshot name={c.name} path={c.profilePath} />
          <p className="mt-2.5 line-clamp-2 break-words text-body-tight font-semibold text-ink">{c.name}</p>
          {c.character && <p className="mt-0.5 line-clamp-2 break-words text-meta text-slate">{c.character}</p>}
        </li>
      ))}
    </ol>
    </div>
  )
}

function RailButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-9 cursor-pointer place-items-center rounded-xl border border-hairline-soft bg-hairline text-slate transition-colors hover:border-highlight/40 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
    >
      {children}
    </button>
  )
}

const roleLabels: Record<CrewRoleKey, [one: string, many: string]> = {
  director: ["Director", "Directors"],
  writer: ["Writer", "Writers"],
  producer: ["Producer", "Producers"],
  composer: ["Music", "Music"],
  cinematographer: ["Cinematography", "Cinematography"],
  editor: ["Editor", "Editors"],
}

// Key crew as a definition list (role, then names): two columns from sm, no rule under every row.
export function CrewList({ crew }: { crew: CrewRole[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
      {crew.map(({ role, people }) => (
        <div key={role} className="flex min-w-0 flex-col gap-1.5">
          <dt className="text-meta text-slate">{roleLabels[role][people.length === 1 ? 0 : 1]}</dt>
          <dd>
            <ul className="flex flex-col gap-1">
              {people.map((p) => (
                <li key={p.id} className="break-words text-body-tight text-ink">
                  <span className="font-semibold">{p.name}</span>
                  {p.detail && <span className="text-slate"> ({p.detail})</span>}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      ))}
    </dl>
  )
}

import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Check, X } from "lucide-react"
import { cn } from "../../lib/utils"
import { catalogDecades, type CatalogQuery, type Genre } from "../../lib/catalogTypes"
import { buttonClass } from "../ui/buttonClass"

const ease = [0.16, 1, 0.3, 1] as const

export interface FilterControls {
  query: CatalogQuery
  genres: Genre[]
  activeFilterCount: number
  toggleGenre: (id: number) => void
  setDecade: (decade: number | null) => void
  clearFilters: () => void
}

// Real checkboxes and radios, visually hidden, with the chip as their label: native keyboard
// behaviour (Space toggles, arrows move between radios) and the whole chip is the hit target.
// Selected chips also show a check, so the state is not carried by colour alone.
function Chip({ type, name, checked, onChange, children }: {
  type: "checkbox" | "radio"
  name: string
  checked: boolean
  onChange: () => void
  children: ReactNode
}) {
  return (
    // relative: sr-only makes the input position:absolute, so without a positioned label it would sit at
    // the corner of the nearest positioned ancestor (the sticky sidebar), and focusing it would scroll
    // the page there instead of to the chip.
    <label className="relative cursor-pointer">
      <input type={type} name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-meta transition-colors",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-highlight",
          checked
            ? "border-action/60 bg-action/15 text-highlight"
            : "border-hairline-soft text-graphite hover:border-ink/25 hover:text-ink",
        )}
      >
        {checked && <Check className="size-3.5" strokeWidth={2.25} aria-hidden="true" />}
        {children}
      </span>
    </label>
  )
}

function FilterFields({ query, genres, toggleGenre, setDecade }: FilterControls) {
  return (
    <div className="flex flex-col gap-8">
      <fieldset>
        <legend className="text-link-sm text-ink">Genres</legend>
        <p className="mt-1 text-meta text-slate">Films must match every genre you pick.</p>
        {genres.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {genres.map((g) => (
              <Chip key={g.id} type="checkbox" name="genres" checked={query.genreIds.includes(g.id)} onChange={() => toggleGenre(g.id)}>
                {g.name}
              </Chip>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-meta text-slate">Genres could not be loaded.</p>
        )}
      </fieldset>

      <fieldset>
        <legend className="text-link-sm text-ink">Release</legend>
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip type="radio" name="decade" checked={query.decade === null} onChange={() => setDecade(null)}>
            Any year
          </Chip>
          {catalogDecades.map((d) => (
            <Chip key={d.value} type="radio" name="decade" checked={query.decade === d.value} onChange={() => setDecade(d.value)}>
              {d.label}
            </Chip>
          ))}
        </div>
      </fieldset>
    </div>
  )
}

function PanelHeader({ titleId, onClose, onClear, canClear }: { titleId: string; onClose: () => void; onClear: () => void; canClear: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 id={titleId} className="text-subtitle font-semibold text-ink">
        Filters
      </h2>
      <div className="flex items-center gap-1">
        <button type="button" onClick={onClear} disabled={!canClear} className={buttonClass("text-link", "text-slate hover:text-ink")}>
          Clear all
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Hide filters"
          className="grid size-9 cursor-pointer place-items-center rounded-lg text-slate transition-colors hover:bg-surface-cool hover:text-ink focus-visible:outline-2 focus-visible:outline-highlight"
        >
          <X className="size-5" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

// lg and up: a column beside the grid. Closed by default so the first view is just films; opening
// it narrows the grid, and the auto-fill columns re-flow on their own. Sticky so the filters stay in
// reach while scrolling a long list; it scrolls internally if taller than the viewport.
export function FilterSidebar({ onClose, ...controls }: FilterControls & { onClose: () => void }) {
  const reduce = useReducedMotion()
  const titleId = useId()
  return (
    <motion.aside
      id="catalog-filters"
      aria-labelledby={titleId}
      className="sticky top-24 max-h-[calc(100dvh-7rem)] w-72 shrink-0 self-start overflow-y-auto overscroll-contain rounded-2xl border border-hairline-soft bg-hairline p-5"
      initial={reduce ? false : { opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease }}
    >
      <PanelHeader titleId={titleId} onClose={onClose} onClear={controls.clearFilters} canClear={controls.activeFilterCount > 0} />
      <div className="mt-6">
        <FilterFields {...controls} />
      </div>
    </motion.aside>
  )
}

interface FilterSheetProps extends FilterControls {
  open: boolean
  onClose: () => void
  // Label for the footer button, e.g. "Show 12 films".
  resultLabel: string
  returnFocusRef: RefObject<HTMLElement | null>
}

// Below lg there is no room for a column, so the same fields slide in as a modal sheet from the
// left. Modal means: Escape and the backdrop close it, focus moves in and is kept inside, the page
// behind does not scroll, and focus returns to the Filters button afterwards.
export function FilterSheet({ open, onClose, resultLabel, returnFocusRef, ...controls }: FilterSheetProps) {
  const reduce = useReducedMotion()
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  // The open/close effect must run only when `open` flips. If it depended on onClose, a parent that
  // passed a fresh function each render would re-run it on every chip toggle, and its cleanup would
  // yank focus back to the Filters button. So the latest onClose is read through a ref instead.
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const returnTo = returnFocusRef.current
    panelRef.current?.focus()
    const { overflow } = document.body.style
    document.body.style.overflow = "hidden"

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current()
        return
      }
      // Keep Tab inside the sheet: wrap from the last control to the first and back.
      if (e.key !== "Tab" || !panelRef.current) return
      const focusable = panelRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), input, select, a[href]")
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = overflow
      returnTo?.focus()
    }
  }, [open, returnFocusRef])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-scrim/60 backdrop-blur-sm"
            onClick={onClose}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.div
            ref={panelRef}
            id="catalog-filters"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="absolute inset-y-0 left-0 flex w-[min(24rem,calc(100%-3rem))] flex-col border-r border-hairline-soft bg-hairline outline-none"
            initial={reduce ? false : { x: "-100%" }}
            animate={{ x: 0 }}
            exit={reduce ? undefined : { x: "-100%" }}
            transition={{ duration: 0.35, ease }}
          >
            <div className="border-b border-hairline-soft px-5 py-4">
              <PanelHeader titleId={titleId} onClose={onClose} onClear={controls.clearFilters} canClear={controls.activeFilterCount > 0} />
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
              <FilterFields {...controls} />
            </div>
            <div className="border-t border-hairline-soft p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button type="button" onClick={onClose} className={buttonClass("primary", "w-full")}>
                {resultLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

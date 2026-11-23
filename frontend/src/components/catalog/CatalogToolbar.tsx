import type { Ref } from "react"
import { Link } from "react-router-dom"
import { ChevronDown, SlidersHorizontal } from "lucide-react"
import { cn } from "../../lib/utils"
import { catalogLists, catalogSorts, listOrderLabel, type CatalogQuery, type CatalogSort } from "../../lib/catalogTypes"
import { catalogSearch } from "./useCatalogParams"

// The 40px control height and lifted surface of the nav's icon tiles, so the toolbar reads as the same family.
const control = "h-10 rounded-xl border border-hairline-soft bg-hairline text-link-sm text-ink transition-colors"
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"

// Lists are links, not buttons: each list is a page you can open in a new tab, bookmark or share.
// Switching keeps the genre/decade filters and sort, and goes back to page 1.
export function ListTabs({ query }: { query: CatalogQuery }) {
  return (
    <nav aria-label="Film lists" className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex w-max gap-1 rounded-xl border border-hairline-soft bg-hairline p-1">
        {catalogLists.map((l) => {
          const active = l.value === query.list
          return (
            <li key={l.value}>
              <Link
                to={{ search: catalogSearch({ ...query, list: l.value, page: 1 }) }}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-8 items-center whitespace-nowrap rounded-lg px-3.5 text-link-sm transition-colors",
                  focusRing,
                  active ? "bg-action/15 text-highlight" : "text-slate hover:bg-surface-cool hover:text-ink",
                )}
              >
                {l.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

interface SortSelectProps {
  query: CatalogQuery
  onChange: (sort: CatalogSort) => void
}

export function SortSelect({ query, onChange }: SortSelectProps) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-meta text-slate">Sort</span>
      <span className="relative">
        {/* Native <select>: keyboard, screen reader and mobile pickers for free. Options get explicit
            colours because Windows paints them with system colours otherwise (white on dark theme). */}
        <select
          name="sort"
          value={query.sort}
          onChange={(e) => onChange(e.target.value as CatalogSort)}
          className={cn(
            control,
            focusRing,
            "cursor-pointer appearance-none pl-3.5 pr-9 hover:border-ink/25 [&_option]:bg-hairline [&_option]:text-ink",
          )}
        >
          <option value="list">{listOrderLabel[query.list]}</option>
          {catalogSorts.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate" aria-hidden="true" />
      </span>
    </label>
  )
}

interface FilterToggleProps {
  open: boolean
  count: number
  onClick: () => void
  // React 19 passes ref as a plain prop (no forwardRef). The mobile sheet uses it to hand focus back
  // to this button when it closes.
  ref?: Ref<HTMLButtonElement>
}

export function FilterToggle({ open, count, onClick, ref }: FilterToggleProps) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-controls="catalog-filters"
      className={cn(
        control,
        focusRing,
        "inline-flex cursor-pointer items-center gap-2 px-3.5 hover:border-ink/25",
        open && "border-action/60",
      )}
    >
      <SlidersHorizontal className="size-4 text-slate" strokeWidth={1.75} aria-hidden="true" />
      Filters
      {count > 0 && (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-action px-1.5 text-micro-caps font-semibold tabular-nums text-on-action">
          {count}
          <span className="sr-only"> active</span>
        </span>
      )}
    </button>
  )
}

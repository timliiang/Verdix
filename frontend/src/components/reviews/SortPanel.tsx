import { useId } from "react"
import { Check, ChevronDown } from "lucide-react"
import { myReviewSorts, type MyReviewSort } from "../../api/reviewApi"
import { cn } from "../../lib/utils"

interface SortProps {
  sort: MyReviewSort
  onChange: (sort: MyReviewSort) => void
}

// The sort, on the side (lg and up). Native radio inputs in a fieldset: arrow keys move between
// options and screen readers announce "radio, 1 of 6" with no ARIA of our own. The input is visually
// hidden; its label is the visible row, styled by whether it holds the checked input (has-checked).
export function SortSidebar({ sort, onChange }: SortProps) {
  const name = useId()
  return (
    <aside className="sticky top-24 w-64 shrink-0 self-start rounded-2xl border border-hairline-soft bg-hairline p-5">
      <fieldset>
        <legend className="mb-3 text-body-tight font-semibold text-ink">Sort by</legend>
        <div className="flex flex-col gap-1">
          {myReviewSorts.map((s) => (
            <label
              key={s.value}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-link-sm text-slate transition-colors",
                "hover:bg-surface-cool hover:text-ink",
                "has-checked:bg-surface-cool has-checked:text-ink",
                "has-focus-visible:outline-2 has-focus-visible:outline-highlight",
              )}
            >
              <input
                type="radio"
                name={name}
                value={s.value}
                checked={sort === s.value}
                onChange={() => onChange(s.value)}
                className="sr-only"
              />
              {s.label}
              {sort === s.value && <Check className="size-4 shrink-0 text-highlight" aria-hidden="true" />}
            </label>
          ))}
        </div>
      </fieldset>
    </aside>
  )
}

// Below lg there is no room for a sidebar: the same choices as a native select above the list,
// which also gives phones their own picker.
export function SortSelect({ sort, onChange }: SortProps) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-meta text-slate">Sort</span>
      <span className="relative">
        <select
          name="sort"
          value={sort}
          onChange={(e) => onChange(e.target.value as MyReviewSort)}
          // Options get explicit colours: Windows paints them with system colours otherwise.
          className="h-10 cursor-pointer appearance-none rounded-xl border border-hairline-soft bg-hairline pl-3.5 pr-9 text-link-sm text-ink hover:border-ink/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight [&_option]:bg-hairline [&_option]:text-ink"
        >
          {myReviewSorts.map((s) => (
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

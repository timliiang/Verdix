import { X } from "lucide-react"
import { catalogDecades, type CatalogQuery, type Genre } from "../../lib/catalogTypes"
import { buttonClass } from "../ui/buttonClass"

interface ActiveFiltersProps {
  query: CatalogQuery
  genres: Genre[]
  toggleGenre: (id: number) => void
  setDecade: (decade: number | null) => void
  clearFilters: () => void
}

const chip =
  "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-action/60 bg-action/15 pl-3 pr-2 text-meta text-highlight transition-colors hover:bg-action/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"

// With the panel hidden, the filters in force would be invisible. This row keeps them on screen,
// each removable in one click, so a short or empty grid always has a visible reason.
export function ActiveFilters({ query, genres, toggleGenre, setDecade, clearFilters }: ActiveFiltersProps) {
  const selectedGenres = genres.filter((g) => query.genreIds.includes(g.id))
  const decade = catalogDecades.find((d) => d.value === query.decade)
  if (selectedGenres.length === 0 && !decade) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {selectedGenres.map((g) => (
        <button key={g.id} type="button" onClick={() => toggleGenre(g.id)} className={chip} aria-label={`Remove ${g.name} filter`}>
          {g.name}
          <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
        </button>
      ))}
      {decade && (
        <button type="button" onClick={() => setDecade(null)} className={chip} aria-label={`Remove ${decade.label} filter`}>
          {decade.label}
          <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
        </button>
      )}
      <button type="button" onClick={clearFilters} className={buttonClass("text-link", "ml-1 text-slate hover:text-ink")}>
        Clear all
      </button>
    </div>
  )
}

import "@fontsource-variable/geist"
import { useCallback, useRef, useState, type ReactNode } from "react"
import { Clapperboard, Loader2, RotateCw } from "lucide-react"
import { HomeFooter, HomeNav } from "../components/home/HomeChrome"
import { useTheme } from "../components/home/useTheme"
import { buttonClass } from "../components/ui/buttonClass"
import { PosterCard, PosterSkeleton } from "../components/catalog/PosterCard"
import { FilterToggle, ListTabs, SortSelect } from "../components/catalog/CatalogToolbar"
import { FilterSheet, FilterSidebar, type FilterControls } from "../components/catalog/FilterPanel"
import { ActiveFilters } from "../components/catalog/ActiveFilters"
import { useCatalogParams } from "../components/catalog/useCatalogParams"
import { useCatalog, useGenres, type CatalogState } from "../components/catalog/useCatalog"
import { useMediaQuery } from "../components/catalog/useMediaQuery"
import { CATALOG_PAGE_SIZE } from "../api/catalogApi"
import { catalogLists } from "../lib/catalogTypes"

const countFormat = new Intl.NumberFormat()
const filmCount = (n: number) => `${countFormat.format(n)} ${n === 1 ? "film" : "films"}`

// Two columns on phones; from sm, as many ~170px+ columns as fit. auto-fill (not fixed counts per
// breakpoint) means opening the filter sidebar simply drops a column instead of squeezing posters.
const grid = "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))] lg:gap-x-6 lg:gap-y-8"

// Verdix's take on TMDB's Popular Movies page: the same poster grid and "Load more" paging, but the
// filters TMDB keeps permanently open are tucked into a panel, so the first view is just films.
// Same frame as the home page: themed root, ambient glow, HomeNav and HomeFooter.
export default function MoviePage() {
  const { theme, toggleTheme } = useTheme()
  const { query, update, loadMore, toggleGenre, clearFilters, activeFilterCount } = useCatalogParams()
  const { state, retry } = useCatalog(query)
  const genres = useGenres()

  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filterButtonRef = useRef<HTMLButtonElement>(null)
  const closeFilters = useCallback(() => setFiltersOpen(false), [])

  const heading = catalogLists.find((l) => l.value === query.list)?.heading ?? "Films"
  const result = state.status === "ready" || state.status === "loading-more" ? state.result : null

  const controls: FilterControls = {
    query,
    genres,
    activeFilterCount,
    toggleGenre,
    setDecade: (decade) => update({ decade }),
    clearFilters,
  }

  return (
    <div data-theme={theme} className="flex min-h-[100dvh] flex-col font-display text-ink antialiased">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-0 size-96 rounded-full bg-action/10 blur-[120px]" />
        <div className="absolute -right-40 top-1/2 size-96 rounded-full bg-action/5 blur-[140px]" />
      </div>

      <HomeNav theme={theme} onToggleTheme={toggleTheme} />

      <main id="main" className="mx-auto w-full max-w-page flex-1 px-4 pb-section pt-10 sm:px-6 sm:pt-12 lg:px-12">
        <header className="flex flex-col gap-3">
          <h1 className="text-balance text-display-sm font-bold text-ink sm:text-display">{heading}</h1>
          {/* Announced politely when filters change the count; the heading itself stays quiet. */}
          <p className="text-meta tabular-nums text-slate" aria-live="polite">
            {result ? filmCount(result.totalResults) : state.status === "error" ? "" : "Loading films…"}
          </p>
        </header>

        <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <ListTabs query={query} />
          <div className="flex items-center justify-between gap-3 md:justify-end">
            <SortSelect query={query} onChange={(sort) => update({ sort })} />
            <FilterToggle ref={filterButtonRef} open={filtersOpen} count={activeFilterCount} onClick={() => setFiltersOpen((o) => !o)} />
          </div>
        </div>

        {/* The sidebar shows the filters itself, so the chip row only appears when it is not open. */}
        {!(isDesktop && filtersOpen) && (
          <div className="mt-4 empty:hidden">
            <ActiveFilters {...controls} />
          </div>
        )}

        <div className="mt-8 flex items-start gap-8">
          {isDesktop && filtersOpen && <FilterSidebar {...controls} onClose={closeFilters} />}

          <section aria-labelledby="catalog-results" className="min-w-0 flex-1">
            <h2 id="catalog-results" className="sr-only">
              Results
            </h2>
            <Results state={state} onRetry={retry} onClear={clearFilters} hasFilters={activeFilterCount > 0} />

            {result?.hasMore && (
              <div className="mt-10">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={state.status === "loading-more"}
                  className={buttonClass("ghost", "w-full disabled:cursor-wait disabled:opacity-70")}
                >
                  {state.status === "loading-more" ? (
                    <>
                      <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                      Loading…
                    </>
                  ) : (
                    "Load more films"
                  )}
                </button>
              </div>
            )}
          </section>
        </div>

        {/* TMDB's terms require this notice wherever its data is shown. */}
        <p className="mt-section max-w-[60ch] text-meta text-ash">
          Film data and posters from{" "}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink" translate="no">
            TMDB
          </a>
          . This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </main>

      <HomeFooter />

      {!isDesktop && (
        <FilterSheet
          {...controls}
          open={filtersOpen}
          onClose={closeFilters}
          returnFocusRef={filterButtonRef}
          resultLabel={result ? `Show ${filmCount(result.totalResults)}` : "Show films"}
        />
      )}
    </div>
  )
}

interface ResultsProps {
  state: CatalogState
  onRetry: () => void
  onClear: () => void
  hasFilters: boolean
}

function Results({ state, onRetry, onClear, hasFilters }: ResultsProps) {
  if (state.status === "loading") {
    return (
      <ul className={grid} aria-busy="true" aria-label="Loading films">
        {Array.from({ length: CATALOG_PAGE_SIZE / 2 }, (_, i) => (
          <li key={i}>
            <PosterSkeleton />
          </li>
        ))}
      </ul>
    )
  }

  if (state.status === "error") {
    return (
      <StatusPanel
        title="Films could not be loaded"
        body="Check your connection, then try again."
        action={
          <button type="button" onClick={onRetry} className={buttonClass("primary")}>
            <RotateCw className="size-4" aria-hidden="true" />
            Try again
          </button>
        }
      />
    )
  }

  const { movies } = state.result
  if (movies.length === 0) {
    return (
      <StatusPanel
        title="No films match"
        body={hasFilters ? "Remove a genre or pick another decade to see more." : "This list is empty right now. Try another list."}
        action={
          hasFilters && (
            <button type="button" onClick={onClear} className={buttonClass("ghost")}>
              Clear filters
            </button>
          )
        }
      />
    )
  }

  return (
    <ul className={grid} aria-busy={state.status === "loading-more"}>
      {movies.map((m, i) => (
        // content-visibility lets the browser skip layout and paint for cards far off screen, so the
        // grid stays fast after many "Load more" pages. The intrinsic size reserves a card's height
        // (poster + caption) so the scrollbar does not jump as skipped cards come into view.
        <li key={m.tmdbId} className="[contain-intrinsic-size:auto_24rem] [content-visibility:auto]">
          {/* Roughly the first row is visible at load; the rest wait until scrolled near. */}
          <PosterCard movie={m} eager={i < 6} />
        </li>
      ))}
    </ul>
  )
}

function StatusPanel({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-hairline-soft px-6 py-16 text-center sm:py-24">
      <Clapperboard className="size-10 text-slate" strokeWidth={1.5} aria-hidden="true" />
      <div className="flex flex-col gap-2">
        <h3 className="text-heading-sm font-semibold text-ink">{title}</h3>
        <p className="max-w-[40ch] text-body text-graphite">{body}</p>
      </div>
      {action}
    </div>
  )
}

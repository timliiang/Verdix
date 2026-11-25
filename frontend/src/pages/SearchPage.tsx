import "@fontsource-variable/geist"
import { useEffect, useState, type ReactNode } from "react"
import { Link, useLocation, useNavigationType, useSearchParams } from "react-router-dom"
import { Loader2, RotateCw, Search, SearchX } from "lucide-react"
import { HomeFooter, HomeNav } from "../components/home/HomeChrome"
import { useTheme } from "../components/home/useTheme"
import { buttonClass } from "../components/ui/buttonClass"
import { PosterCard, PosterSkeleton } from "../components/catalog/PosterCard"
import { SEARCH_DEBOUNCE_MS, useSearchResults } from "../components/search/useFilmSearch"
import { useDebouncedValue } from "../lib/useDebouncedValue"
import { parseApiError } from "../api/apiError"
import { MIN_SEARCH_LENGTH } from "../api/searchApi"
import { cn } from "../lib/utils"

// The catalog's grid, so a search result looks exactly like a browsed film.
const grid = "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))] lg:gap-x-6 lg:gap-y-8"
const countFormat = new Intl.NumberFormat()

// /search?q=..., public. Results update as you type (debounced) and the query lives in the URL,
// so a search can be shared, reloaded, and returned to with Back.
//
// Two writers share ?q=: this page (as you type) and everything else (the nav's search, Back and
// Forward). This page writes with replace, so typing does not stack history entries. Any other
// navigation (PUSH or POP) remounts the view with the URL's query: otherwise a debounce still
// pending from the old text could write it back over the new one.
export default function SearchPage() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const [params] = useSearchParams()
  const [viewKey, setViewKey] = useState(location.key)
  // Adjusting state during render (React's pattern for "reset when a prop changes"): React re-renders
  // straight away with the new key, before anything is painted.
  if (navigationType !== "REPLACE" && location.key !== viewKey) setViewKey(location.key)

  return <SearchView key={viewKey} initialText={params.get("q") ?? ""} />
}

function SearchView({ initialText }: { initialText: string }) {
  const { theme, toggleTheme } = useTheme()
  const [params, setParams] = useSearchParams()
  const [input, setInput] = useState(initialText)
  const { query, enabled, pending, films, total } = useSearchResults(input)

  // Mirror the settled text into the URL. Debounced on its own clock: the URL only needs the
  // final text, and replace keeps Back meaning "leave search", not "un-type a letter".
  const settled = useDebouncedValue(input.trim(), SEARCH_DEBOUNCE_MS)
  const urlText = params.get("q") ?? ""
  useEffect(() => {
    if (settled === urlText) return
    setParams(settled ? { q: settled } : {}, { replace: true })
  }, [settled, urlText, setParams])

  const trimmed = input.trim()
  // keepPreviousData: while a new search loads, the previous results stay, dimmed.
  const showingOld = pending || query.isPlaceholderData
  const busy = enabled && (pending || query.isFetching) && !query.isFetchingNextPage

  return (
    <div data-theme={theme} className="flex min-h-[100dvh] flex-col font-display text-ink antialiased">
      <title>{trimmed ? `Search: ${trimmed} | Verdix` : "Search | Verdix"}</title>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-0 size-96 rounded-full bg-action/10 blur-[120px]" />
        <div className="absolute -right-40 top-1/2 size-96 rounded-full bg-action/5 blur-[140px]" />
      </div>

      <HomeNav theme={theme} onToggleTheme={toggleTheme} />

      <main id="main" className="mx-auto w-full max-w-page flex-1 px-4 pb-section pt-10 sm:px-6 sm:pt-12 lg:px-12">
        <h1 className="text-display-sm font-bold text-ink sm:text-display">Search</h1>

        <form role="search" onSubmit={(e) => e.preventDefault()} className="relative mt-6 max-w-2xl">
          <label htmlFor="search-page-input" className="sr-only">
            Search films by title
          </label>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate" aria-hidden="true" />
          <input
            id="search-page-input"
            type="search"
            name="q"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            // Only when arriving with nothing typed: then typing is the one thing to do here.
            autoFocus={!initialText}
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            maxLength={100}
            placeholder="Film title, e.g. Dune…"
            className="h-14 w-full rounded-2xl border border-hairline-soft bg-hairline pl-12 pr-12 text-subtitle text-ink outline-none transition-[border-color] placeholder:text-slate focus:border-highlight/60 [&::-webkit-search-cancel-button]:hidden"
          />
          {busy && (
            <Loader2 className="absolute right-4 top-1/2 size-5 -translate-y-1/2 animate-spin text-slate motion-reduce:animate-none" aria-hidden="true" />
          )}
        </form>

        {/* One status line, announced politely when it changes. */}
        <p className="mt-4 min-h-5 text-meta tabular-nums text-slate" aria-live="polite">
          {statusLine({ trimmed, enabled, busy, total, hasData: query.data !== undefined && !showingOld, failed: query.isError })}
        </p>

        <section aria-label="Results" className="mt-8">
          <Results
            trimmed={trimmed}
            enabled={enabled}
            isPending={query.isPending}
            failed={query.isError && films.length === 0}
            errorMessage={
              query.isError
                ? parseApiError(query.error, { server: "The film catalogue is busy. Wait a moment, then try again." }).message
                : ""
            }
            onRetry={() => query.refetch()}
            retrying={query.isFetching}
            films={films}
            dimmed={showingOld}
          />

          {films.length > 0 && !showingOld && (query.hasNextPage || query.isFetchNextPageError) && (
            <div className="mt-10 flex flex-col gap-3">
              {query.isFetchNextPageError && <p className="text-meta text-ink" role="alert">More results could not be loaded.</p>}
              <button
                type="button"
                onClick={() => query.fetchNextPage()}
                disabled={query.isFetchingNextPage}
                className={buttonClass("ghost", "w-full disabled:cursor-wait disabled:opacity-70")}
              >
                {query.isFetchingNextPage ? (
                  <>
                    <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    Loading…
                  </>
                ) : query.isFetchNextPageError ? (
                  "Try Again"
                ) : (
                  "Load More Results"
                )}
              </button>
            </div>
          )}
        </section>

        <p className="mt-section max-w-[60ch] text-meta text-ash">
          Film data and posters from{" "}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink" translate="no">
            TMDB
          </a>
          . This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </main>

      <HomeFooter />
    </div>
  )
}

function statusLine({ trimmed, enabled, busy, total, hasData, failed }: {
  trimmed: string
  enabled: boolean
  busy: boolean
  total: number
  hasData: boolean
  failed: boolean
}): string {
  if (!trimmed) return ""
  if (!enabled) return `Type at least ${MIN_SEARCH_LENGTH} letters to search.`
  if (busy) return "Searching…"
  if (failed) return ""
  if (hasData) return `${countFormat.format(total)} ${total === 1 ? "film" : "films"} for “${trimmed}”`
  return ""
}

interface ResultsProps {
  trimmed: string
  enabled: boolean
  isPending: boolean
  failed: boolean
  errorMessage: string
  onRetry: () => void
  retrying: boolean
  films: ReturnType<typeof useSearchResults>["films"]
  dimmed: boolean
}

function Results({ trimmed, enabled, isPending, failed, errorMessage, onRetry, retrying, films, dimmed }: ResultsProps) {
  if (!enabled) {
    return (
      <Panel icon={<Search className="size-10 text-slate" strokeWidth={1.5} aria-hidden="true" />} title={trimmed ? "Keep typing" : "Find a film"}>
        Search by title. Or{" "}
        <Link to="/movies" className="text-highlight underline underline-offset-4">
          browse popular films
        </Link>
        .
      </Panel>
    )
  }

  if (failed) {
    return (
      <Panel icon={<SearchX className="size-10 text-slate" strokeWidth={1.5} aria-hidden="true" />} title="Search isn't available right now">
        <span className="block">{errorMessage}</span>
        <button type="button" onClick={onRetry} disabled={retrying} className={buttonClass("primary", "mt-5 disabled:cursor-wait")}>
          {retrying ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <RotateCw className="size-4" aria-hidden="true" />}
          {retrying ? "Retrying…" : "Try Again"}
        </button>
      </Panel>
    )
  }

  // First search, nothing to keep on screen yet: skeleton cards in the final grid.
  if (isPending && films.length === 0) {
    return (
      <ul className={grid} aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <li key={i}>
            <PosterSkeleton />
          </li>
        ))}
      </ul>
    )
  }

  if (!dimmed && films.length === 0) {
    return (
      <Panel icon={<SearchX className="size-10 text-slate" strokeWidth={1.5} aria-hidden="true" />} title={`No films match “${trimmed}”`}>
        Check the spelling, or try fewer words.
      </Panel>
    )
  }

  return (
    <ul className={cn(grid, "transition-opacity duration-200", dimmed && "opacity-50")} aria-busy={dimmed}>
      {films.map((m, i) => (
        <li key={m.tmdbId} className="[contain-intrinsic-size:auto_24rem] [content-visibility:auto]">
          <PosterCard movie={m} eager={i < 6} />
        </li>
      ))}
    </ul>
  )
}

function Panel({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-hairline-soft px-6 py-16 text-center sm:py-20">
      {icon}
      <div className="flex flex-col gap-2">
        <h2 className="text-balance text-heading-sm font-semibold text-ink">{title}</h2>
        <p className="max-w-[44ch] text-pretty text-body text-graphite">{children}</p>
      </div>
    </div>
  )
}

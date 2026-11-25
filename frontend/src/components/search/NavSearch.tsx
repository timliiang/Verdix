import { useId, useState, type FormEvent, type KeyboardEvent } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight, Film, Loader2, Search } from "lucide-react"
import { cn } from "../../lib/utils"
import { releaseYear } from "../../lib/format"
import { posterUrl } from "../../lib/tmdbImage"
import { MIN_SEARCH_LENGTH, searchPath } from "../../api/searchApi"
import { useSearchPreview } from "./useFilmSearch"

const MAX_SUGGESTIONS = 6

const field =
  "h-10 w-full rounded-xl border border-hairline-soft bg-hairline pl-10 pr-9 text-link-sm font-normal text-ink outline-none transition-[border-color] placeholder:text-slate focus:border-highlight/60 [&::-webkit-search-cancel-button]:hidden"

// The nav's search field: a WAI-ARIA combobox with a listbox of suggestions.
// - Typing opens the list; results follow the debounced text (useSearchPreview).
// - Focus never leaves the input. ArrowUp/Down move a highlight, which aria-activedescendant
//   reports to screen readers. Enter opens the highlighted film, or the full results page.
// - Escape closes the list, and clears the field when the list is already closed.
// - Options are not links (a listbox may not contain interactive elements); a click navigates.
export function NavSearch({ className }: { className?: string }) {
  const navigate = useNavigate()
  const id = useId()
  const listId = `${id}-list`
  const [input, setInput] = useState("")
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const { query, enabled, pending } = useSearchPreview(input)

  const films = enabled ? (query.data?.results ?? []).slice(0, MAX_SUGGESTIONS) : []
  // The last option is always "See all results", once there is something to search for.
  const optionCount = enabled ? films.length + 1 : 0
  const busy = enabled && (pending || query.isFetching)
  const typedEnough = input.trim().length >= MIN_SEARCH_LENGTH
  const showPanel = open && input.trim().length > 0

  const reset = () => {
    setInput("")
    setOpen(false)
    setActive(-1)
  }

  const go = (index: number) => {
    if (index >= 0 && index < films.length) navigate(`/movies/${films[index].tmdbId}`)
    else navigate(searchPath(input))
    reset()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (optionCount === 0) return
      e.preventDefault()
      setOpen(true)
      // Wraps at both ends. From "nothing highlighted" (-1), Down goes to the first option and
      // Up to the last ("See all results").
      if (e.key === "ArrowDown") setActive((a) => (a + 1 >= optionCount ? 0 : a + 1))
      else setActive((a) => (a - 1 < 0 ? optionCount - 1 : a - 1))
    } else if (e.key === "Escape") {
      if (open && input) setOpen(false)
      else reset()
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    // With an option highlighted, Enter picks it; otherwise it is "see all results".
    go(open ? active : -1)
  }

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      // Close when focus leaves the whole widget (not when it moves within it).
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}
      className={cn("relative", className)}
    >
      <label htmlFor={`${id}-input`} className="sr-only">
        Search films
      </label>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate" aria-hidden="true" />
      <input
        id={`${id}-input`}
        type="search"
        name="q"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-activedescendant={showPanel && active >= 0 ? `${id}-opt-${active}` : undefined}
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        maxLength={100}
        placeholder="Search films…"
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          setOpen(true)
          setActive(-1)
        }}
        onFocus={() => input && setOpen(true)}
        onKeyDown={onKeyDown}
        className={field}
      />
      {busy && (
        <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-slate motion-reduce:animate-none" aria-hidden="true" />
      )}

      {showPanel && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-hairline-soft bg-canvas shadow-[0_20px_50px_-20px_oklch(0.2_0.02_265/0.45)]">
          <SearchStatus
            typedEnough={typedEnough}
            loading={busy && films.length === 0}
            failed={query.isError && films.length === 0}
            empty={enabled && !busy && query.isSuccess && films.length === 0}
            text={input.trim()}
          />
          <ul id={listId} role="listbox" aria-label="Film suggestions" className={cn("max-h-[min(70vh,28rem)] overflow-y-auto py-1", busy && films.length > 0 && "opacity-70")}>
            {films.map((f, i) => {
              const year = releaseYear(f.releaseDate)
              return (
                <li
                  key={f.tmdbId}
                  id={`${id}-opt-${i}`}
                  role="option"
                  aria-selected={active === i}
                  // mousedown would blur the input first and close the list before the click lands.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(i)}
                  onMouseEnter={() => setActive(i)}
                  className={cn("flex cursor-pointer items-center gap-3 px-3 py-2", active === i && "bg-hairline")}
                >
                  <span className="grid h-12 w-8 shrink-0 place-items-center overflow-hidden rounded-inline bg-surface-cool">
                    {f.posterPath ? (
                      <img src={posterUrl(f.posterPath, 185)} alt="" width={32} height={48} loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <Film className="size-4 text-slate" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-tight font-semibold text-ink">{f.title}</span>
                    <span className="block text-meta tabular-nums text-slate">{year ?? "Release date to be announced"}</span>
                  </span>
                </li>
              )
            })}
            {enabled && (
              <li
                id={`${id}-opt-${films.length}`}
                role="option"
                aria-selected={active === films.length}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(-1)}
                onMouseEnter={() => setActive(films.length)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 border-t border-hairline-soft px-3 py-2.5 text-link-sm text-highlight",
                  active === films.length && "bg-hairline",
                )}
              >
                <span className="truncate">See all results for “{input.trim()}”</span>
                <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
              </li>
            )}
          </ul>
        </div>
      )}
    </form>
  )
}

// One status line above the options, announced politely. Exactly one state applies at a time.
function SearchStatus({ typedEnough, loading, failed, empty, text }: {
  typedEnough: boolean
  loading: boolean
  failed: boolean
  empty: boolean
  text: string
}) {
  let message: string | null = null
  if (!typedEnough) message = `Type at least ${MIN_SEARCH_LENGTH} letters to search.`
  else if (loading) message = "Searching…"
  else if (failed) message = "Search isn't available right now. Try again in a moment."
  else if (empty) message = `No films match “${text}”.`

  return (
    <p aria-live="polite" className={cn("px-3 text-meta text-slate", message ? "pb-1 pt-3" : "sr-only")}>
      {message}
    </p>
  )
}

// The drawer's field on phones: no dropdown (there is no room under it), just a search that
// opens the results page. onDone closes the drawer.
export function DrawerSearch({ className, onDone }: { className?: string; onDone: () => void }) {
  const navigate = useNavigate()
  const [input, setInput] = useState("")
  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault()
        navigate(searchPath(input))
        onDone()
      }}
    >
      <label className="relative block">
        <span className="sr-only">Search films</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate" aria-hidden="true" />
        <input
          type="search"
          name="q"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          maxLength={100}
          placeholder="Search films…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={field}
        />
      </label>
    </form>
  )
}

import { Link } from "react-router-dom"
import { Loader2, RotateCw } from "lucide-react"
import { buttonClass } from "../ui/buttonClass"
import { PosterCard, PosterSkeleton } from "../catalog/PosterCard"
import { Reveal } from "./Reveal"
import { parseApiError } from "../../api/apiError"
import { pickFeatured, useNowPlayingFilms } from "./useHomeFilms"

const RAIL_SIZE = 6

// Six-up grid at xl, a swipeable snap rail below it (the original home rail's layout), filled with
// TMDB's live Now Playing list. Same cards as /movies, so each links to its film page.
const rail =
  "no-scrollbar mx-auto mt-10 flex max-w-page snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 pt-1 sm:scroll-px-6 sm:px-6 lg:scroll-px-12 lg:px-12 xl:grid xl:grid-cols-6 xl:overflow-visible"
const cell = "w-[44vw] max-w-[220px] shrink-0 snap-start xl:w-auto xl:max-w-none"

export function NowPlayingRail() {
  // Shares its query with the hero (same key), so the two never disagree and only one request goes out.
  const nowPlaying = useNowPlayingFilms()
  // The films after the hero's, so the page does not show the #1 film twice.
  const featuredId = pickFeatured(nowPlaying.data?.results)?.tmdbId
  const films = (nowPlaying.data?.results ?? []).filter((m) => m.tmdbId !== featuredId).slice(0, RAIL_SIZE)

  return (
    <section id="now-playing" aria-labelledby="home-now-playing" className="py-section">
      <div className="mx-auto flex max-w-page items-baseline justify-between gap-6 px-4 sm:px-6 lg:px-12">
        <h2 id="home-now-playing" className="text-heading-md font-bold text-ink">
          In cinemas now
        </h2>
        {/* Opens the catalog on the same list, so "all" means all of these. */}
        <Link to="/movies?list=now_playing" className={buttonClass("text-link", "shrink-0 text-highlight")}>
          All films
        </Link>
      </div>

      {nowPlaying.isError && films.length === 0 ? (
        <div className="mx-auto mt-10 max-w-page px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-hairline-soft px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-meta text-ink" role="alert">
              {parseApiError(nowPlaying.error, { server: "Films in cinemas could not be loaded. Try again in a moment." }).message}
            </p>
            <button type="button" onClick={() => nowPlaying.refetch()} disabled={nowPlaying.isFetching} className={buttonClass("ghost", "shrink-0 disabled:cursor-wait")}>
              {nowPlaying.isFetching ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <RotateCw className="size-4" aria-hidden="true" />}
              {nowPlaying.isFetching ? "Retrying…" : "Try Again"}
            </button>
          </div>
        </div>
      ) : films.length === 0 ? (
        <ul className={rail} aria-busy="true" aria-label="Loading films in cinemas">
          {Array.from({ length: RAIL_SIZE }, (_, i) => (
            <li key={i} className={cell}>
              <PosterSkeleton />
            </li>
          ))}
        </ul>
      ) : (
        <ol className={rail}>
          {films.map((film, i) => (
            <li key={film.tmdbId} className={cell}>
              <Reveal delay={i * 0.06} className="h-full">
                <PosterCard movie={film} />
              </Reveal>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

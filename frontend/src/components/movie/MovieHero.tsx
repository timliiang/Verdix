import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import { Clock, Film, Play } from "lucide-react"
import { buttonClass } from "../ui/buttonClass"
import { ScoreNumeral } from "../ui/ScoreNumeral"
import { cn } from "../../lib/utils"
import { formatRuntime, releaseYear } from "../../lib/format"
import { backdropSrcSet, backdropUrl, posterSrcSet, posterUrl } from "../../lib/tmdbImage"
import type { MovieDetail } from "../../lib/movieTypes"

const ease = [0.16, 1, 0.3, 1] as const

const chip = "inline-flex items-center gap-1 rounded-full bg-canvas/60 px-2.5 py-1 text-meta text-ink-soft ring-1 ring-inset ring-ink/10 backdrop-blur-sm"

interface MovieHeroProps {
  movie: MovieDetail
  onPlayTrailer: () => void
  // The write/edit review button, passed in so the hero stays layout only (no auth or review state).
  reviewAction: ReactNode
}

// The film's backdrop as a contained photo stage (the home hero's frame), with the poster, title,
// key facts and the Verdix score over it. data-surface="stage" pins the night palette: light copy
// on a dark photo in either theme. Hero stack: title, one chip row, tagline, CTAs.
export function MovieHero({ movie, onPlayTrailer, reviewAction }: MovieHeroProps) {
  const reduce = useReducedMotion()
  const year = releaseYear(movie.releaseDate)
  const runtime = formatRuntime(movie.runtime)
  const directors = movie.crew.find((r) => r.role === "director")?.people ?? []
  const median = movie.rating.median

  return (
    <section
      data-surface="stage"
      aria-labelledby="film-title"
      className="relative isolate overflow-hidden rounded-2xl border border-hairline-soft bg-scrim"
    >
      {movie.backdropPath && (
        <motion.img
          src={backdropUrl(movie.backdropPath, 1280)}
          srcSet={backdropSrcSet(movie.backdropPath)}
          sizes="(min-width: 1280px) 1232px, 100vw"
          alt=""
          width={1280}
          height={720}
          fetchPriority="high"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_25%]"
          initial={reduce ? false : { scale: 1.06, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease }}
        />
      )}
      {/* Legibility scrims: a floor under the copy and a side-light behind it, as on the home hero. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-canvas from-25% via-canvas/80 via-55% to-canvas/30" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-canvas/90 via-canvas/40 to-transparent" />

      <motion.div
        className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-end gap-x-5 gap-y-6 px-5 pb-6 pt-28 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-x-8 sm:px-8 sm:pb-8 sm:pt-40 lg:grid-cols-[13rem_minmax(0,1fr)_auto] lg:px-10 lg:pb-10 lg:pt-48"
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease }}
      >
        <div className="aspect-[2/3] self-end overflow-hidden rounded-media sm:row-span-2 bg-surface-cool shadow-[0_24px_60px_-20px_oklch(0.1_0.01_265/0.8)] ring-1 ring-ink/10">
          {movie.posterPath ? (
            <img
              src={posterUrl(movie.posterPath, 342)}
              srcSet={posterSrcSet(movie.posterPath)}
              sizes="(min-width: 1024px) 208px, (min-width: 640px) 160px, 104px"
              alt={`Poster for ${movie.title}`}
              width={500}
              height={750}
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-slate">
              <Film className="size-8" strokeWidth={1.5} aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
          <h1 id="film-title" className="text-balance break-words text-heading-md font-bold text-ink sm:text-display night:text-glow-action">
            {movie.title}
            {year && <span className="sr-only"> ({year})</span>}
          </h1>
          <ul className="flex flex-wrap items-center gap-2" aria-label="Key facts">
            {year && <li className={cn(chip, "tabular-nums")}>{year}</li>}
            {movie.certification && (
              <li className={chip}>
                <span className="sr-only">Rated </span>
                {movie.certification.rating}
              </li>
            )}
            {runtime && (
              <li className={chip}>
                <Clock className="size-3.5" aria-hidden="true" />
                {runtime}
              </li>
            )}
            {movie.status && movie.status !== "Released" && <li className={chip}>{movie.status}</li>}
          </ul>
        </div>

        {/* Beside the poster from sm (it spans both rows there); under poster and title on phones. */}
        <div className="col-span-2 flex flex-col gap-4 self-start sm:col-span-1 sm:col-start-2 sm:-mt-2">
          <HeroCopy movie={movie} directors={directors} onPlayTrailer={onPlayTrailer} reviewAction={reviewAction} />
        </div>

        {/* The score earns its own row on phones only when there is one; "not rated" is said by
            the score panel right below the overview, so here it shows at lg only. */}
        <div
          className={cn(
            "col-span-2 items-end justify-between gap-4 border-t border-ink/10 pt-5 lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:flex lg:flex-col lg:items-end lg:self-end lg:border-t-0 lg:pt-0",
            median !== null ? "flex" : "hidden",
          )}
        >
          {median !== null ? (
            <>
              <ScoreNumeral score={median} tone="accent" className="night:text-glow-action" />
              <a href="#rating" className="text-meta text-ash underline-offset-4 hover:text-ink hover:underline">
                Verdix score from {movie.rating.reviewCount} {movie.rating.reviewCount === 1 ? "review" : "reviews"}
              </a>
            </>
          ) : (
            <p className="max-w-[16ch] text-right text-meta text-ash">No Verdix score yet</p>
          )}
        </div>
      </motion.div>
    </section>
  )
}

function HeroCopy({
  movie,
  directors,
  onPlayTrailer,
  reviewAction,
}: {
  movie: MovieDetail
  directors: { id: number; name: string }[]
  onPlayTrailer: () => void
  reviewAction: ReactNode
}) {
  return (
    <>
      {movie.tagline && <p className="max-w-[48ch] text-pretty text-body italic text-graphite">{movie.tagline}</p>}
      {directors.length > 0 && (
        <p className="text-body text-graphite">
          Directed by <span className="font-semibold text-ink">{directors.map((d) => d.name).join(", ")}</span>
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {movie.videos.length > 0 && (
          <button type="button" onClick={onPlayTrailer} className={buttonClass("primary")}>
            <Play className="size-4 fill-current" aria-hidden="true" />
            Play Trailer
          </button>
        )}
        {reviewAction}
      </div>
    </>
  )
}

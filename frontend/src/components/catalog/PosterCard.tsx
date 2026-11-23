import { Link } from "react-router-dom"
import { Film } from "lucide-react"
import { cn } from "../../lib/utils"
import { formatReleaseDate } from "../../lib/format"
import { posterSrcSet, posterUrl } from "../../lib/tmdbImage"
import type { CatalogMovie } from "../../lib/catalogTypes"

// The cell is locked to 2:3, the standard one-sheet ratio TMDB posters use (w500 = 500x750), so any
// poster added later fills it edge to edge with no cropping. width/height on the <img> give the
// browser that ratio before the file arrives, so the grid never shifts as posters load.
const frame = "aspect-[2/3] overflow-hidden bg-surface-cool"

// The card shell from FilmCard's themed skin: bordered, lifted surface, lifts 4px on hover.
const shell = "flex h-full flex-col overflow-hidden rounded-xl border border-hairline-soft bg-hairline"

interface PosterCardProps {
  movie: CatalogMovie
  // The first row is on screen at load: fetch it right away instead of lazily.
  eager?: boolean
}

export function PosterCard({ movie, eager = false }: PosterCardProps) {
  const date = formatReleaseDate(movie.releaseDate)

  // The whole card is one link (to the future film page), named by its <h3>. The poster is alt=""
  // because the title right below already says what it is; reading both would repeat it.
  return (
    <Link
      to={`/movies/${movie.tmdbId}`}
      className={cn(
        shell,
        "group transition-[translate,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-action/60",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight motion-reduce:hover:translate-y-0",
      )}
    >
      <div className={frame}>
        {movie.posterPath ? (
          <img
            src={posterUrl(movie.posterPath, 342)}
            srcSet={posterSrcSet(movie.posterPath)}
            // Two columns on phones; from sm the auto-fill grid keeps cells near 170-230px.
            sizes="(min-width: 640px) 232px, 50vw"
            alt=""
            width={500}
            height={750}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center text-slate">
            <Film className="size-8" strokeWidth={1.5} aria-hidden="true" />
            <span className="text-meta">No poster yet</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3.5">
        <h3 className="line-clamp-2 text-pretty text-body-tight font-semibold text-ink">{movie.title}</h3>
        <p className="text-meta text-slate">{date ?? "Release date to be announced"}</p>
      </div>
    </Link>
  )
}

// Same frame and caption rhythm as PosterCard, so nothing moves when the real cards replace it.
export function PosterSkeleton() {
  return (
    <div aria-hidden="true" className={shell}>
      <div className={cn(frame, "animate-pulse motion-reduce:animate-none")} />
      <div className="flex flex-col gap-2 p-3.5">
        <div className="h-4 w-4/5 rounded bg-surface-cool" />
        <div className="h-3 w-2/5 rounded bg-surface-cool" />
      </div>
    </div>
  )
}

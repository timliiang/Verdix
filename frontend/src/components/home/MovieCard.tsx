import { Bookmark } from "lucide-react"
import type { HomeMovie } from "../../lib/homeTypes"
import { StarRating } from "./StarRating"
import { initials } from "../../lib/format"

export function MovieCard({ movie }: { movie: HomeMovie }) {
  return (
    <article className="group relative flex w-56 shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:glow-accent">
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.posterUrl}
          alt={`Poster for ${movie.title}`}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />
        <button
          className="absolute right-2 top-2 grid size-8 place-items-center rounded-lg bg-black/50 text-white/90 opacity-0 backdrop-blur transition-all duration-200 hover:bg-primary hover:text-primary-foreground group-hover:opacity-100"
          aria-label={`Add ${movie.title} to watchlist`}
        >
          <Bookmark className="size-4" />
        </button>
        <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur">
          {movie.year}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight text-foreground">{movie.title}</h3>
        </div>
        <StarRating rating={movie.averageRating} showValue size={13} />

        <div className="mt-1 rounded-lg bg-secondary/60 p-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`grid size-5 shrink-0 place-items-center rounded-full bg-gradient-to-br ${movie.latestReview.author.avatarColor} text-[9px] font-bold text-black`}
              aria-hidden="true"
            >
              {initials(movie.latestReview.author.name)}
            </span>
            <span className="truncate text-xs font-medium text-foreground/80">
              {movie.latestReview.author.name}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            &ldquo;{movie.latestReview.body}&rdquo;
          </p>
        </div>
      </div>
    </article>
  )
}

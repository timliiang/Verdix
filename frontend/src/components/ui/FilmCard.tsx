import { cn } from "../../lib/utils"
import { ScoreNumeral } from "./ScoreNumeral"

export interface FilmCardData {
  title: string
  year: number
  genre: string
  posterUrl: string
  score: number
  rank?: number
}

interface FilmCardProps {
  film: FilmCardData
  // "side" suits cards 220px and wider; "below" keeps titles readable in narrow six-up rails.
  scorePlacement?: "side" | "below"
  className?: string
}

// Light: flat, like DESIGN.md's studios-tile, a poster on the cool placeholder and a caption below.
// skin: on the themed home page, the bordered card from the original "/", lifting on hover.
export function FilmCard({ film, scorePlacement = "side", className }: FilmCardProps) {
  const below = scorePlacement === "below"
  return (
    <article
      className={cn(
        "group flex h-full flex-col gap-4",
        "skin:gap-0 skin:overflow-hidden skin:rounded-xl skin:border skin:border-hairline-soft skin:bg-hairline skin:transition skin:duration-300 skin:hover:-translate-y-1 skin:hover:border-action/60",
        className,
      )}
    >
      <div className="overflow-hidden rounded-media bg-surface-cool skin:rounded-none">
        <img
          src={film.posterUrl}
          alt={`Poster for ${film.title}`}
          loading="lazy"
          className="aspect-[2/3] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] skin:group-hover:scale-105"
        />
      </div>
      <div
        className={cn(
          "flex gap-3 border-t border-hairline pt-3 skin:border-t-0 skin:p-3.5",
          below ? "flex-col" : "items-start justify-between",
        )}
      >
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="line-clamp-2 text-body-tight text-ink skin:font-semibold">
            {film.rank !== undefined && <span className="mr-2 tabular-nums text-stone skin:text-highlight">{film.rank}</span>}
            {film.title}
          </h3>
          <p className="text-meta text-slate">
            {film.year} · {film.genre}
          </p>
        </div>
        <ScoreNumeral score={film.score} size="sm" tone="accent" />
      </div>
    </article>
  )
}

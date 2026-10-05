import { PenLine, Play, Flame, Clock } from "lucide-react"
import type { HomeMovie } from "../../lib/homeTypes"
import { StarRating } from "./StarRating"
import { formatCount, formatRuntime } from "../../lib/format"

export function HeroSection({ movie }: { movie: HomeMovie }) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden rounded-2xl border border-border"
    >
      <div className="absolute inset-0">
        <img
          src={movie.backdropUrl ?? movie.posterUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="relative flex flex-col justify-end gap-5 p-6 pt-40 sm:p-10 sm:pt-56 lg:max-w-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/30">
            <Flame className="size-3.5" aria-hidden="true" />
            Trending Movie of the Week
          </span>
          {movie.genres.map((g) => (
            <span
              key={g}
              className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-white/10"
            >
              {g}
            </span>
          ))}
        </div>

        <h1 id="hero-title" className="text-balance text-4xl font-bold tracking-tight sm:text-6xl text-glow">
          {movie.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <StarRating rating={movie.averageRating} showValue size={16} />
          <span aria-hidden="true" className="text-border">|</span>
          <span>{formatCount(movie.reviewCount)} reviews</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden="true" />
            {formatRuntime(movie.runtimeMinutes)}
          </span>
          <span>{movie.year}</span>
        </div>

        <p className="max-w-xl text-pretty text-sm leading-relaxed text-foreground/80 sm:text-base">
          {movie.synopsis}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:brightness-110 hover:glow-accent">
            <PenLine className="size-4" aria-hidden="true" />
            Write Review
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-white/5 px-5 py-3 text-sm font-semibold text-foreground backdrop-blur transition-colors duration-200 hover:bg-white/10">
            <Play className="size-4" aria-hidden="true" />
            Watch Trailer
          </button>
        </div>
      </div>
    </section>
  )
}

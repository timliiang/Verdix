import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { HomeMovie } from "../../lib/homeTypes"
import { MovieCard } from "./MovieCard"

export function RecentlyReviewed({ movies }: { movies: HomeMovie[] }) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollBy = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 480, behavior: "smooth" })
  }

  return (
    <section aria-labelledby="recent-title" className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="recent-title" className="text-xl font-bold tracking-tight sm:text-2xl">
            Recently Reviewed
          </h2>
          <p className="text-sm text-muted-foreground">Fresh takes from the community</p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            onClick={() => scrollBy(-1)}
            className="grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            aria-label="Scroll right"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2"
      >
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  )
}

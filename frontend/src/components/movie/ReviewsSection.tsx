import { Loader2, MessageSquareText, RotateCw } from "lucide-react"
import { Section } from "./Section"
import { buttonClass } from "../ui/buttonClass"
import { ScoreNumeral } from "../ui/ScoreNumeral"
import { formatReleaseDate, initials } from "../../lib/format"
import { useMovieReviews } from "./useMovieDetail"
import type { MovieReview } from "../../lib/movieTypes"

const countFormat = new Intl.NumberFormat()

// Members' reviews, newest first. Until a film has one, this is the placeholder: writing reviews
// from this page is still to come. The list is fetched only when the rating says reviews exist.
export function ReviewsSection({ tmdbId, title, reviewCount }: { tmdbId: number; title: string; reviewCount: number }) {
  const { state, loadMore, retry } = useMovieReviews(tmdbId, reviewCount)

  return (
    <Section
      id="reviews"
      title="Reviews"
      aside={reviewCount > 0 && <span className="text-meta tabular-nums text-slate">{countFormat.format(reviewCount)} total</span>}
    >
      {state.status === "idle" && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-hairline-soft px-6 py-10 sm:flex-row sm:items-center sm:gap-5">
          <MessageSquareText className="size-8 shrink-0 text-slate" strokeWidth={1.5} aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <h3 className="text-body-tight font-semibold text-ink">No reviews of {title} yet</h3>
            <p className="max-w-[52ch] text-pretty text-meta text-slate">
              Reviews from Verdix members show up here, and the film gets its Verdix score with the first one.
            </p>
          </div>
        </div>
      )}

      {state.status === "loading" && (
        <ul aria-busy="true" aria-label="Loading reviews" className="flex flex-col gap-4">
          {[0, 1].map((i) => (
            <li key={i} className="h-32 animate-pulse rounded-2xl border border-hairline-soft bg-hairline motion-reduce:animate-none" />
          ))}
        </ul>
      )}

      {state.status === "error" && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-hairline-soft px-6 py-8">
          <p className="text-meta text-slate">Reviews could not be loaded. Check your connection, then try again.</p>
          <button type="button" onClick={retry} className={buttonClass("ghost")}>
            <RotateCw className="size-4" aria-hidden="true" />
            Try Again
          </button>
        </div>
      )}

      {state.status === "ready" && (
        <>
          <ul className="flex flex-col gap-4" aria-busy={state.loadingMore}>
            {state.reviews.map((r) => (
              <li key={r.id}>
                <ReviewCard review={r} />
              </li>
            ))}
          </ul>
          {state.hasMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={state.loadingMore}
              className={buttonClass("ghost", "mt-6 w-full disabled:cursor-wait disabled:opacity-70")}
            >
              {state.loadingMore ? (
                <>
                  <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  Loading…
                </>
              ) : (
                "Show More Reviews"
              )}
            </button>
          )}
        </>
      )}
    </Section>
  )
}

function ReviewCard({ review }: { review: MovieReview }) {
  const watched = formatReleaseDate(review.watchedDate)
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-hairline-soft bg-hairline p-5">
      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {review.userImageUrl ? (
            <img src={review.userImageUrl} alt="" width={36} height={36} loading="lazy" className="size-9 shrink-0 rounded-full object-cover" />
          ) : (
            <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-cool text-micro-caps font-bold text-ink-soft">
              {initials(review.username)}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-body-tight font-semibold text-ink">{review.username}</p>
            {watched && <p className="text-meta text-slate">Watched {watched}</p>}
          </div>
        </div>
        <ScoreNumeral score={review.rating} size="sm" tone="accent" digits={0} />
      </header>
      {review.reviewText && (
        <p className="whitespace-pre-line break-words text-pretty text-body text-graphite">{review.reviewText}</p>
      )}
    </article>
  )
}

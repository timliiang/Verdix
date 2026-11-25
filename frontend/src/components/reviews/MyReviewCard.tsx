import { Link } from "react-router-dom"
import { Film, MessageCircle } from "lucide-react"
import { ScoreNumeral } from "../ui/ScoreNumeral"
import { formatReleaseDate } from "../../lib/format"
import { posterSrcSet, posterUrl } from "../../lib/tmdbImage"
import type { MyReview } from "../../api/reviewApi"

// One of the member's reviews: poster, film, score, their words, and a placeholder where comments
// on the review will go. The poster and title link to the film page, where the review is edited.
export function MyReviewCard({ review, eager }: { review: MyReview; eager: boolean }) {
  const filmHref = `/movies/${review.tmdbId}`
  const watched = formatReleaseDate(review.watchedDate)
  // createdAt is a local date-time ("2026-11-25T15:17:02"); the date part is all the card shows.
  const reviewed = formatReleaseDate(review.createdAt.slice(0, 10))

  return (
    <article className="flex gap-4 rounded-2xl border border-hairline-soft bg-hairline p-4 sm:gap-6 sm:p-5">
      {/* Decorative duplicate of the title link: hidden from the tab order and screen readers. */}
      <Link to={filmHref} tabIndex={-1} aria-hidden="true" className="w-20 shrink-0 self-start sm:w-28">
        {review.posterPath ? (
          <img
            src={posterUrl(review.posterPath, 185)}
            srcSet={posterSrcSet(review.posterPath)}
            sizes="(min-width: 640px) 112px, 80px"
            alt=""
            width={112}
            height={168}
            loading={eager ? "eager" : "lazy"}
            className="aspect-[2/3] w-full rounded-lg object-cover ring-1 ring-inset ring-ink/10"
          />
        ) : (
          <div className="grid aspect-[2/3] w-full place-items-center rounded-lg bg-surface-cool text-slate">
            <Film className="size-6" strokeWidth={1.5} />
          </div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-balance text-body-tight font-semibold text-ink">
              <Link to={filmHref} className="rounded-inline underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight">
                {review.title}
              </Link>
              {review.releaseYear && <span className="font-normal text-slate"> ({review.releaseYear})</span>}
            </h3>
            <p className="mt-0.5 text-meta text-slate">
              {watched ? `Watched ${watched}` : `Reviewed ${reviewed}`}
            </p>
          </div>
          <ScoreNumeral score={review.rating} size="sm" tone="accent" digits={0} className="shrink-0" />
        </header>

        {review.reviewText ? (
          <p className="line-clamp-6 whitespace-pre-line break-words text-pretty text-body text-graphite">{review.reviewText}</p>
        ) : (
          <p className="text-meta italic text-slate">Just a score, no words this time.</p>
        )}

        {/* Placeholder until comments exist: says what will live here, without a control that does
            nothing. Plain text rather than a disabled button, which keyboard users can't even reach. */}
        <footer className="mt-auto flex items-center gap-2 border-t border-hairline-soft pt-3 text-meta text-slate">
          <MessageCircle className="size-4" strokeWidth={1.75} aria-hidden="true" />
          Comments
          <span className="rounded-full border border-hairline-soft px-2 py-0.5 text-micro-caps uppercase tracking-wide">Coming soon</span>
        </footer>
      </div>
    </article>
  )
}

export function MyReviewCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex gap-4 rounded-2xl border border-hairline-soft bg-hairline p-4 sm:gap-6 sm:p-5">
      <div className="aspect-[2/3] w-20 shrink-0 animate-pulse rounded-lg bg-surface-cool motion-reduce:animate-none sm:w-28" />
      <div className="flex flex-1 flex-col gap-3 pt-1">
        <div className="h-4 w-1/2 rounded bg-surface-cool" />
        <div className="h-3 w-1/4 rounded bg-surface-cool" />
        <div className="mt-2 h-3 w-full rounded bg-surface-cool" />
        <div className="h-3 w-4/5 rounded bg-surface-cool" />
      </div>
    </div>
  )
}

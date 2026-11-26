import { Loader2, MessageSquareText, RotateCw, SquarePen, Trash2 } from "lucide-react"
import { Section } from "./Section"
import { buttonClass } from "../ui/buttonClass"
import { FormError } from "../ui/FormError"
import { ScoreNumeral } from "../ui/ScoreNumeral"
import { useAuth } from "../../context/AuthContext"
import { formatReleaseDate, initials } from "../../lib/format"
import { parseApiError } from "../../api/apiError"
import { useMovieReviews } from "./useMovieDetail"
import type { ReviewEditor } from "./useReviewEditor"
import type { MovieReview } from "../../lib/movieTypes"

const countFormat = new Intl.NumberFormat()

// Members' reviews, newest first. Until a film has one, this is the placeholder. Every request
// state is shown inline where it happens: a skeleton for the first page, a retry note for a failed
// first page, a retry note under the list for a failed "Show More".
//
// Writing a review starts at the top of the page (the hero's ReviewAction). Here, the member's own
// card offers Edit and Delete; both go through the page's shared ReviewEditor, which owns the
// popups and toasts (ReviewEditorLayer).
export function ReviewsSection({ tmdbId, title, reviewCount, editor }: { tmdbId: number; title: string; reviewCount: number; editor: ReviewEditor }) {
  const { query, reviews, total } = useMovieReviews(tmdbId, reviewCount)
  const { username } = useAuth()

  // First page failed (after the automatic retries) vs a later page failed: the loaded reviews
  // stay on screen and the error sits where the next page would have appeared.
  const firstPageFailed = query.isError && reviews.length === 0
  const nextPageFailed = query.isFetchNextPageError

  return (
    <Section
      id="reviews"
      title="Reviews"
      aside={reviewCount > 0 && <span className="text-meta tabular-nums text-slate">{countFormat.format(total)} total</span>}
    >
      {reviewCount === 0 && (
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

      {reviewCount > 0 && query.isPending && (
        <>
          <p className="sr-only" role="status">
            Loading reviews…
          </p>
          <ul aria-hidden="true" className="flex flex-col gap-4">
            {[0, 1].map((i) => (
              <li key={i} className="h-32 animate-pulse rounded-2xl border border-hairline-soft bg-hairline motion-reduce:animate-none" />
            ))}
          </ul>
        </>
      )}

      {firstPageFailed && (
        <RetryNote message={parseApiError(query.error, { server: "Reviews could not be loaded. Try again in a moment." }).message} onRetry={() => query.refetch()} pending={query.isFetching} />
      )}

      {reviewCount > 0 && reviews.length > 0 && (
        <>
          <ul className="flex flex-col gap-4" aria-busy={query.isFetchingNextPage}>
            {reviews.map((r) => (
              <li key={r.id}>
                <ReviewCard
                  review={r}
                  isOwn={username !== null && r.username === username}
                  onEdit={editor.mine.review ? editor.open : undefined}
                  onDelete={() => editor.requestDelete(r.id)}
                />
              </li>
            ))}
          </ul>

          {nextPageFailed ? (
            <div className="mt-6">
              <RetryNote message="More reviews could not be loaded." onRetry={() => query.fetchNextPage()} pending={query.isFetchingNextPage} />
            </div>
          ) : (
            query.hasNextPage && (
              <button
                type="button"
                onClick={() => query.fetchNextPage()}
                disabled={query.isFetchingNextPage}
                className={buttonClass("ghost", "mt-6 w-full disabled:cursor-wait disabled:opacity-70")}
              >
                {query.isFetchingNextPage ? (
                  <>
                    <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    Loading…
                  </>
                ) : (
                  "Show More Reviews"
                )}
              </button>
            )
          )}
        </>
      )}
    </Section>
  )
}

function RetryNote({ message, onRetry, pending }: { message: string; onRetry: () => void; pending: boolean }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-hairline-soft px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
      <FormError message={message} />
      <button type="button" onClick={onRetry} disabled={pending} className={buttonClass("ghost", "shrink-0 disabled:cursor-wait")}>
        {pending ? (
          <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        ) : (
          <RotateCw className="size-4" aria-hidden="true" />
        )}
        {pending ? "Retrying…" : "Try Again"}
      </button>
    </div>
  )
}

const cardAction =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-inline px-1 py-1 text-link-sm text-slate transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"

function ReviewCard({ review, isOwn, onEdit, onDelete }: { review: MovieReview; isOwn: boolean; onEdit?: () => void; onDelete: () => void }) {
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
            <p className="truncate text-body-tight font-semibold text-ink">
              {review.username}
              {isOwn && <span className="font-normal text-slate"> (you)</span>}
            </p>
            {watched && <p className="text-meta text-slate">Watched {watched}</p>}
          </div>
        </div>
        <ScoreNumeral score={review.rating} size="sm" tone="accent" digits={0} />
      </header>
      {review.reviewText && <p className="whitespace-pre-line break-words text-pretty text-body text-graphite">{review.reviewText}</p>}
      {isOwn && (
        <div className="flex justify-end gap-2">
          {onEdit && (
            <button type="button" onClick={onEdit} className={cardAction}>
              <SquarePen className="size-3.5" aria-hidden="true" />
              Edit Review
            </button>
          )}
          <button type="button" onClick={onDelete} className={cardAction}>
            <Trash2 className="size-3.5" aria-hidden="true" />
            Delete Review
          </button>
        </div>
      )}
    </article>
  )
}

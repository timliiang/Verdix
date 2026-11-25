import { useEffect, useId, useRef, useState, type FormEvent } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { buttonClass } from "../ui/buttonClass"
import { DatePicker } from "../ui/DatePicker"
import { FormError } from "../ui/FormError"
import { useCreateReview, useUpdateReview } from "./useReviewMutations"
import type { ApiError } from "../../api/apiError"
import type { SavedReview } from "../../api/reviewApi"

// Mirrors @Size(max = 1000) on the review requests' reviewText.
const MAX_TEXT = 1000
const DEFAULT_RATING = 5
// Year dropdown floor when TMDB has no release date.
const FALLBACK_FROM_YEAR = 1900

interface ReviewFormDialogProps {
  tmdbId: number
  title: string
  // ISO release date or null; the date picker's year dropdown starts at its year.
  releaseDate: string | null
  // The member's existing review: edit mode, prefilled. null: write a new one.
  existing: SavedReview | null
  onClose: () => void
  onSaved: (mode: "created" | "updated") => void
  onFailed: (error: ApiError) => void
  // Edit mode's Delete: the parent closes this and opens its confirm dialog for that review.
  onRequestDelete: (reviewId: number) => void
}

// The review popup, for writing a first review or editing your one review of a film (the backend
// allows one per member per film). The parent renders it only while open, so each opening starts
// from fresh state: blank for a new review, the saved values for an edit.
//
// Native <dialog> + showModal(), like ConfirmDialog: focus trap, Esc, inert page and focus return
// come from the browser. Pessimistic like the other review writes: it stays open while saving and
// closes only once the server accepted the change and the score has refetched. While saving, Esc
// and Cancel are blocked so a half-sent review can't look cancelled. Failures show inline (so the
// fix is next to the form) and as a toast (via onFailed).
//
// Signed-in only. The parent shows it only to signed-in members, but the real gate is the backend:
// the write endpoints need a token and take the author from it, never from the request body.
export function ReviewFormDialog({ tmdbId, title, releaseDate, existing, onClose, onSaved, onFailed, onRequestDelete }: ReviewFormDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const ratingId = useId()
  const textId = useId()
  const countId = useId()
  const create = useCreateReview(tmdbId)
  const update = useUpdateReview(tmdbId)
  const mutation = existing ? update : create

  const [rating, setRating] = useState(existing?.rating ?? DEFAULT_RATING)
  const [text, setText] = useState(existing?.reviewText ?? "")
  const [watchedDate, setWatchedDate] = useState<string | null>(existing?.watchedDate ?? null)

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const pending = mutation.isPending
  const error = mutation.error
  const fieldErrors = error?.fieldErrors ?? {}
  // Only a network or server failure might go differently on a second try.
  const retryable = error?.kind === "network" || error?.kind === "server"
  const fromYear = Number(releaseDate?.slice(0, 4)) || FALLBACK_FROM_YEAR

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (pending) return
    const input = { rating, reviewText: text.trim(), watchedDate }
    const callbacks = {
      onError: (err: unknown) => onFailed(mutation.parseError(err)),
    }
    if (existing) {
      update.mutate({ reviewId: existing.id, input }, { ...callbacks, onSuccess: () => onSaved("updated") })
    } else {
      create.mutate(input, { ...callbacks, onSuccess: () => onSaved("created") })
    }
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        if (pending) e.preventDefault()
      }}
      onClose={onClose}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(100%-2rem,32rem)] overflow-y-auto overscroll-contain rounded-2xl border border-hairline-soft bg-canvas p-0 text-ink shadow-2xl backdrop:bg-scrim/60 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={submit} className="flex flex-col gap-6 p-6">
        <h2 id={titleId} className="text-balance text-heading-sm font-bold text-ink">
          {existing ? `Edit your review of ${title}` : `Review ${title}`}
        </h2>

        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor={ratingId} className="text-body text-ink">
              Your score
            </label>
            {/* aria-hidden: the slider already announces its value via aria-valuetext. */}
            <p aria-hidden="true" className="text-heading-sm font-bold tabular-nums text-ink">
              {rating}
              <span className="text-body font-normal text-slate"> / 10</span>
            </p>
          </div>
          <input
            id={ratingId}
            type="range"
            min={1}
            max={10}
            step={1}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            disabled={pending}
            aria-valuetext={`${rating} out of 10`}
            className="w-full cursor-pointer accent-[var(--color-highlight)] disabled:cursor-not-allowed"
          />
          <div aria-hidden="true" className="flex justify-between text-micro-caps tabular-nums text-slate">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor={textId} className="text-body text-ink">
            Your thoughts <span className="text-slate">(optional)</span>
          </label>
          <textarea
            id={textId}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX_TEXT}
            rows={5}
            disabled={pending}
            placeholder={`What did you think of ${title}?`}
            aria-describedby={countId}
            aria-invalid={fieldErrors.reviewText ? true : undefined}
            className="w-full resize-y rounded-xl border border-hairline-soft bg-canvas px-4 py-3 text-body text-ink outline-none transition-colors placeholder:text-stone focus:border-highlight focus:ring-2 focus:ring-action/30 disabled:cursor-not-allowed disabled:text-mute aria-invalid:border-2 aria-invalid:border-ink"
          />
          <p id={countId} className="self-end text-meta tabular-nums text-slate">
            {text.length} / {MAX_TEXT}
          </p>
        </div>

        <DatePicker
          label="Date watched"
          value={watchedDate}
          onChange={setWatchedDate}
          fromYear={fromYear}
          placeholder="When did you watch it?"
          disabled={pending}
          error={fieldErrors.watchedDate}
        />

        <div aria-live="polite">{error && <FormError message={fieldErrors.reviewText ?? fieldErrors.rating ?? error.message} />}</div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          {existing && (
            <button
              type="button"
              onClick={() => onRequestDelete(existing.id)}
              disabled={pending}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-inline px-1 py-2 text-link-sm text-slate transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight disabled:cursor-not-allowed sm:mr-auto"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Delete Review
            </button>
          )}
          <div className="flex flex-col-reverse gap-3 sm:ml-auto sm:flex-row">
            <button type="button" onClick={onClose} disabled={pending} className={buttonClass("ghost")}>
              Cancel
            </button>
            <button type="submit" disabled={pending} aria-busy={pending} className={buttonClass("primary", "disabled:cursor-wait disabled:opacity-80")}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  {existing ? "Saving…" : "Posting…"}
                </>
              ) : retryable ? (
                "Try Again"
              ) : existing ? (
                "Save Changes"
              ) : (
                "Post Review"
              )}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  )
}

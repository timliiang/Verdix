import { Link, useLocation } from "react-router-dom"
import { Loader2, PenLine, SquarePen } from "lucide-react"
import { buttonClass } from "../ui/buttonClass"
import { ConfirmDialog } from "../ui/ConfirmDialog"
import { Toast } from "../ui/Toast"
import { ReviewFormDialog } from "./ReviewFormDialog"
import { cn } from "../../lib/utils"
import type { ReviewEditor } from "./useReviewEditor"

// A frosted secondary button, so the review action sits beside Play Trailer without competing
// with it as a second solid button.
const heroGlass = buttonClass(
  "text-link",
  "h-12 rounded-xl border border-hairline-soft bg-ink/5 px-5 text-button backdrop-blur hover:bg-ink/10 hover:no-underline sm:h-10",
)

// The review action at the top of the film page. Signed out: a link to /login carrying this page
// in router state (as ProtectedRoute does), so LoginPage's useReturnTo brings them back here.
// Signed in: "Rate This Film", or "Edit Your Review" with their score once they have one. Hiding
// the form from signed-out visitors is only UX; the backend refuses their writes regardless.
//
// primary: the solid button, used when it is the hero's only action (a film with no trailer).
export function ReviewAction({ editor, primary }: { editor: ReviewEditor; primary: boolean }) {
  const location = useLocation()
  const { mine } = editor
  const style = primary ? buttonClass("primary") : heroGlass

  if (!mine.signedIn) {
    return (
      <Link to="/login" state={{ from: location }} className={style}>
        <PenLine className="size-4" aria-hidden="true" />
        Sign In to Rate
      </Link>
    )
  }

  // While "mine" loads we don't yet know which button is right: hold the space, disabled.
  if (mine.query.isPending) {
    return (
      <button type="button" disabled aria-busy="true" className={cn(style, "disabled:cursor-wait")}>
        <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        <span className="sr-only">Checking for your review…</span>
        <span aria-hidden="true">Review</span>
      </button>
    )
  }

  return mine.review ? (
    <button type="button" onClick={editor.open} className={style}>
      <SquarePen className="size-4" aria-hidden="true" />
      Edit Your Review
      <span className="tabular-nums opacity-70">· {mine.review.rating}/10</span>
    </button>
  ) : (
    <button type="button" onClick={editor.open} className={style}>
      <PenLine className="size-4" aria-hidden="true" />
      Rate This Film
    </button>
  )
}

// The popups and toast, rendered once per page. Mounted outside the hero on purpose: the hero is
// data-surface="stage" (forced dark palette), and the dialogs should follow the page's theme.
export function ReviewEditorLayer({ editor, tmdbId, title, releaseDate }: { editor: ReviewEditor; tmdbId: number; title: string; releaseDate: string | null }) {
  const { mine, remove } = editor
  const deleteError = remove.error

  return (
    <>
      {/* Mounted only while open, so each opening starts from fresh state. Opens only once "mine"
          has loaded, so it never shows a blank form to someone who already has a review. */}
      {editor.editorOpen && !mine.query.isPending && (
        <ReviewFormDialog
          tmdbId={tmdbId}
          title={title}
          releaseDate={releaseDate}
          existing={mine.review}
          onClose={editor.close}
          onSaved={editor.onSaved}
          onFailed={editor.onFailed}
          onRequestDelete={editor.requestDelete}
        />
      )}

      <ConfirmDialog
        open={editor.confirming !== null}
        title={`Delete your review of ${title}?`}
        confirmLabel="Delete Review"
        pendingLabel="Deleting…"
        pending={remove.isPending}
        error={deleteError?.message}
        // Retrying a 404 or 403 fails the same way; a network or server error might not.
        canRetry={deleteError ? deleteError.kind === "network" || deleteError.kind === "server" : true}
        onConfirm={editor.confirmDelete}
        onClose={editor.cancelDelete}
      >
        Your score and words are removed, and the film's Verdix score is recalculated. This can't be undone.
      </ConfirmDialog>

      <Toast toast={editor.toast.toast} onDismiss={editor.toast.dismiss} />
    </>
  )
}

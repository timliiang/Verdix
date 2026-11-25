import { useState } from "react"
import { useMyReview } from "./useMovieDetail"
import { useDeleteReview } from "./useReviewMutations"
import { useToast } from "../ui/useToast"
import { reviewQuips } from "../../lib/reviewQuips"
import type { ApiError } from "../../api/apiError"

// Everything about writing, editing and deleting the member's own review of a film, in one place.
//
// Lifted to the film page (MovieContent) because two distant parts of the page drive it: the hero's
// "Rate This Film" / "Edit Your Review" button at the top, and the Edit / Delete links on the
// member's own card down in Reviews. State lives in their closest common ancestor; both just call
// open() or requestDelete(id). ReviewEditorLayer renders the popups and the toast once per page.
export function useReviewEditor(tmdbId: number) {
  const mine = useMyReview(tmdbId)
  const remove = useDeleteReview(tmdbId)
  const toast = useToast()
  const [editorOpen, setEditorOpen] = useState(false)
  // The id of the review awaiting delete confirmation. Held here, not in a card, so the dialog
  // survives the card disappearing when the list refetches (e.g. after "already deleted").
  const [confirming, setConfirming] = useState<number | null>(null)

  return {
    mine,
    remove,
    toast,
    editorOpen,
    confirming,
    open: () => setEditorOpen(true),
    close: () => setEditorOpen(false),
    onSaved: (mode: "created" | "updated") => {
      setEditorOpen(false)
      toast.show({ tone: "success", ...reviewQuips[mode]() })
    },
    onFailed: (error: ApiError) => toast.show({ tone: "error", ...reviewQuips.failed(error) }),
    // From a card's Delete, or the edit popup's Delete (which it replaces rather than stacking).
    requestDelete: (reviewId: number) => {
      setEditorOpen(false)
      setConfirming(reviewId)
    },
    cancelDelete: () => {
      setConfirming(null)
      remove.reset()
    },
    confirmDelete: () => {
      if (confirming === null) return
      // Closes only on success; on failure the dialog stays open with the error.
      remove.mutate(confirming, {
        onSuccess: () => {
          setConfirming(null)
          toast.show({ tone: "success", ...reviewQuips.deleted() })
        },
      })
    },
  }
}

export type ReviewEditor = ReturnType<typeof useReviewEditor>

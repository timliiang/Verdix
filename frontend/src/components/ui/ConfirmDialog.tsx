import { useEffect, useId, useRef, type ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { buttonClass } from "./buttonClass"
import { FormError } from "./FormError"

interface ConfirmDialogProps {
  open: boolean
  title: string
  children?: ReactNode
  confirmLabel: string
  // Shown on the confirm button while the action runs ("Deleting…").
  pendingLabel: string
  pending: boolean
  // An inline error from the last attempt; the dialog stays open so the user can retry or cancel.
  error?: string
  // False when repeating the action cannot help (it was already deleted, or not yours): the
  // confirm button goes and Cancel becomes Close.
  canRetry?: boolean
  onConfirm: () => void
  onClose: () => void
}

// A confirmation step for destructive actions, on the native <dialog> (as the artwork lightbox):
// showModal() makes the page inert and traps focus, Esc cancels, and focus returns to the button
// that opened it. Pessimistic: it stays open while the request runs and closes only when the
// caller sets open=false on success. While pending, Esc and Cancel are disabled so a half-finished
// delete cannot be dismissed and look like it was cancelled.
export function ConfirmDialog({ open, title, children, confirmLabel, pendingLabel, pending, error, canRetry = true, onConfirm, onClose }: ConfirmDialogProps) {
  const showConfirm = !error || canRetry
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const bodyId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={children ? bodyId : undefined}
      // Esc fires "cancel" first; blocking it while pending keeps the dialog up.
      onCancel={(e) => {
        if (pending) e.preventDefault()
      }}
      onClose={onClose}
      className="m-auto w-[min(100%-2rem,28rem)] overscroll-contain rounded-2xl border border-hairline-soft bg-canvas p-0 text-ink shadow-2xl backdrop:bg-scrim/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-2">
          <h2 id={titleId} className="text-balance text-heading-sm font-bold text-ink">
            {title}
          </h2>
          {children && (
            <div id={bodyId} className="text-pretty text-body text-graphite">
              {children}
            </div>
          )}
        </div>
        {/* aria-live so a failure is announced; FormError adds role="alert" when it renders. */}
        <div aria-live="polite">{error && <FormError message={error} />}</div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {/* autoFocus on Cancel: the safe choice is the default, so Enter does not delete. */}
          <button type="button" autoFocus onClick={onClose} disabled={pending} className={buttonClass("ghost")}>
            {showConfirm ? "Cancel" : "Close"}
          </button>
          {showConfirm && (
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            aria-busy={pending}
            className={buttonClass("primary", "disabled:cursor-wait disabled:opacity-80")}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                {pendingLabel}
              </>
            ) : error ? (
              "Try Again"
            ) : (
              confirmLabel
            )}
          </button>
          )}
        </div>
      </div>
    </dialog>
  )
}

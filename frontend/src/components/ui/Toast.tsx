import { useEffect, useRef } from "react"
import { motion, useReducedMotion } from "motion/react"
import { CircleAlert, PartyPopper, X } from "lucide-react"
import { cn } from "../../lib/utils"
import type { ToastMessage } from "./useToast"

const DURATION_MS = { success: 5000, error: 8000 }

// A brief notification after an action, bottom-centre on phones and bottom-right from sm.
//
// Rendered with the Popover API (popover="manual" + showPopover()) rather than position: fixed
// and a z-index. A modal <dialog> sits in the browser's top layer, above every z-index on the page,
// so an ordinary fixed toast would be hidden behind the review dialog's backdrop. A shown popover
// joins the top layer too, above whatever entered it earlier, so the toast is visible even while
// the dialog is open. "manual" means it ignores outside clicks and Esc (Esc belongs to the dialog);
// it closes on its timer or its own button.
//
// Errors stay longer (8s) than successes (5s): they usually carry something to read and act on.
export function Toast({ toast, onDismiss }: { toast: ToastMessage | null; onDismiss: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || !toast) return
    // Hide and re-show so a toast arriving while a dialog is open is raised above that dialog.
    if (el.matches(":popover-open")) el.hidePopover()
    el.showPopover()
    const timer = window.setTimeout(onDismiss, DURATION_MS[toast.tone])
    return () => {
      window.clearTimeout(timer)
      if (el.matches(":popover-open")) el.hidePopover()
    }
  }, [toast, onDismiss])

  const error = toast?.tone === "error"
  const Icon = error ? CircleAlert : PartyPopper

  return (
    <div
      ref={ref}
      popover="manual"
      // The UA styles centre a popover with inset: 0 and margin: auto; reset both and pin it.
      className="inset-auto bottom-4 left-4 right-4 m-0 overflow-visible border-0 bg-transparent p-0 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[24rem]"
    >
      {toast && (
        <motion.div
          key={toast.id}
          role={error ? "alert" : "status"}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className={cn(
            "flex items-start gap-3 rounded-2xl border bg-canvas p-4 pr-3 text-ink shadow-2xl",
            error ? "border-ink/40" : "border-highlight/50",
          )}
        >
          <Icon className={cn("mt-0.5 size-5 shrink-0", error ? "text-ink" : "text-highlight")} strokeWidth={1.75} aria-hidden="true" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-body-tight font-semibold text-ink">{toast.title}</p>
            {toast.body && <p className="text-pretty text-meta text-graphite">{toast.body}</p>}
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="-m-1 grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-slate transition-colors hover:bg-hairline hover:text-ink focus-visible:outline-2 focus-visible:outline-highlight"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </div>
  )
}

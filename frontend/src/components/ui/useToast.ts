import { useCallback, useState } from "react"

export type ToastTone = "success" | "error"

export interface ToastMessage {
  // New for every show(), so the same message twice in a row still re-animates and restarts its timer.
  id: number
  tone: ToastTone
  title: string
  body?: string
}

// One toast at a time: a new one replaces the current one rather than stacking.
// Kept apart from Toast.tsx so that file exports only a component (React Fast Refresh).
export function useToast() {
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const show = useCallback((t: Omit<ToastMessage, "id">) => setToast({ ...t, id: Date.now() }), [])
  const dismiss = useCallback(() => setToast(null), [])
  return { toast, show, dismiss }
}

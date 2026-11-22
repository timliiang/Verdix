import { CircleAlert } from "lucide-react"

// A form-level error (one not tied to a field). Same treatment as TextField's error note: weight,
// an icon and copy, no signal colour. role="alert" so screen readers announce it when it appears.
export function FormError({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p role="alert" className="flex items-start gap-1.5 text-meta font-semibold text-ink">
      <CircleAlert className="mt-px size-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
      {message}
    </p>
  )
}

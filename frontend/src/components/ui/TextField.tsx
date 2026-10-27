import { useId, type ComponentProps } from "react"
import { CircleAlert } from "lucide-react"
import { cn } from "../../lib/utils"

interface TextFieldProps extends ComponentProps<"input"> {
  label: string
  helper?: string
  error?: string
}

// DESIGN.md form-field: label above, helper in meta below, focus deepens the edge, and errors use
// weight, an icon and copy rather than red (the system has no signal colours).
// Light (DESIGN.md, /styleguide): a 1px bottom rule, no box, no radius.
// skin: (themed pages): the boxed 12px field from the home nav's search, on the canvas inside a card.
// ref is a plain prop in React 19, so react-hook-form's register() ref reaches the input via ...props.
export function TextField({ label, helper, error, className, id, ...props }: TextFieldProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const noteId = `${fieldId}-note`
  const note = error ?? helper

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={fieldId} className="text-body text-ink skin:text-link-sm">
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={note ? noteId : undefined}
        className={cn(
          "w-full rounded-none border-0 border-b border-hairline-soft bg-canvas py-3 text-body text-ink outline-none transition-colors",
          "placeholder:text-stone focus:border-ink",
          "aria-invalid:border-b-2 aria-invalid:border-ink",
          "disabled:cursor-not-allowed disabled:text-mute",
          "skin:h-12 skin:rounded-xl skin:border skin:border-hairline-soft skin:px-4 skin:py-0",
          "skin:focus:border-highlight skin:focus:ring-2 skin:focus:ring-action/30",
          "skin:aria-invalid:border-2 skin:aria-invalid:border-ink",
        )}
        {...props}
      />
      {note && (
        <p id={noteId} className={cn("flex items-start gap-1.5 text-meta", error ? "font-semibold text-ink" : "text-stone skin:text-slate")}>
          {error && <CircleAlert className="mt-px size-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />}
          {note}
        </p>
      )}
    </div>
  )
}

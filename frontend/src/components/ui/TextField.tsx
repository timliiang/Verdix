import { useId, type InputHTMLAttributes } from "react"
import { cn } from "../../lib/utils"

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  helper?: string
  error?: string
}

// DESIGN.md form-field: a 1px bottom rule, no box, no radius. Focus deepens the rule to ink.
// Errors use weight and copy rather than red, since the system has no signal colours.
export function TextField({ label, helper, error, className, id, ...props }: TextFieldProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const noteId = `${fieldId}-note`
  const note = error ?? helper

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={fieldId} className="text-body text-ink">
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
        )}
        {...props}
      />
      {note && (
        <p id={noteId} className={cn("text-meta", error ? "font-semibold text-ink" : "text-stone")}>
          {note}
        </p>
      )}
    </div>
  )
}

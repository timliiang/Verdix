import { useId, useState } from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"
import { CalendarDays, ChevronDown, X } from "lucide-react"
import { cn } from "../../lib/utils"

// An optional date as a calendar: month and year dropdowns in the caption (captionLayout="dropdown")
// to jump across years quickly, then a day grid. react-day-picker supplies the hard parts: the grid
// semantics, arrow-key navigation between days, and locale-aware month and weekday names.
//
// The value is an ISO date string ("2026-03-07") or null, the same shape the API uses, so the form
// never holds a Date. Conversion is in local time on purpose: new Date("2026-03-07") parses as UTC
// midnight, which is the previous evening (and so the previous day) anywhere west of Greenwich.
//
// The calendar opens inline, below the trigger, rather than in a floating popover: this sits inside
// a modal <dialog>, and an inline panel needs no positioning, can't be clipped, and is in the
// dialog's own tab order.

function fromIso(iso: string | null): Date | undefined {
  if (!iso) return undefined
  const [y, m, d] = iso.split("-").map(Number)
  return y && m && d ? new Date(y, m - 1, d) : undefined
}

function toIso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const displayFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "long" })

interface DatePickerProps {
  label: string
  value: string | null
  onChange: (value: string | null) => void
  // Earliest year in the year dropdown. Days after today can't be picked.
  fromYear: number
  placeholder?: string
  disabled?: boolean
  error?: string
}

export function DatePicker({ label, value, onChange, fromYear, placeholder = "Pick a date", disabled, error }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const labelId = useId()
  const panelId = useId()
  const selected = fromIso(value)
  const today = new Date()
  // Guard an upcoming film (release year after this year): the range must not run backwards.
  const startYear = Math.min(fromYear, today.getFullYear())

  return (
    <div className="flex flex-col gap-2">
      <span id={labelId} className="text-body text-ink">
        {label} <span className="text-slate">(optional)</span>
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          disabled={disabled}
          aria-expanded={open}
          aria-controls={panelId}
          aria-labelledby={`${labelId} ${panelId}-value`}
          className={cn(
            "flex h-12 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-xl border border-hairline-soft bg-canvas px-4 text-left text-body transition-colors",
            "hover:border-highlight/60 focus-visible:border-highlight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/30",
            "disabled:cursor-not-allowed disabled:text-mute",
            error && "border-2 border-ink",
          )}
        >
          <CalendarDays className="size-4 shrink-0 text-slate" aria-hidden="true" />
          <span id={`${panelId}-value`} className={cn("flex-1 truncate", selected ? "text-ink" : "text-stone")}>
            {selected ? displayFormat.format(selected) : placeholder}
          </span>
          <ChevronDown className={cn("size-4 shrink-0 text-slate transition-transform", open && "rotate-180")} aria-hidden="true" />
        </button>
        {selected && (
          <button
            type="button"
            onClick={() => {
              onChange(null)
              setOpen(false)
            }}
            disabled={disabled}
            aria-label={`Clear ${label.toLowerCase()}`}
            className="grid size-12 shrink-0 cursor-pointer place-items-center rounded-xl border border-hairline-soft text-slate transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight disabled:cursor-not-allowed"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {open && (
        <div
          id={panelId}
          // Theme the library's CSS variables from Verdix tokens, and shrink the day cells a little
          // so seven columns fit a phone-width dialog (7 x 40px = 280px).
          className={cn(
            "self-start rounded-xl border border-hairline-soft bg-canvas p-3 text-ink",
            "[--rdp-accent-color:var(--color-highlight)] [--rdp-accent-background-color:var(--color-hairline)]",
            "[--rdp-day-height:40px] [--rdp-day-width:40px] [--rdp-day_button-height:38px] [--rdp-day_button-width:38px]",
          )}
        >
          <DayPicker
            mode="single"
            captionLayout="dropdown"
            selected={selected}
            defaultMonth={selected ?? today}
            startMonth={new Date(startYear, 0)}
            endMonth={today}
            disabled={{ after: today }}
            onSelect={(date) => {
              // Clicking the selected day again deselects it (date is undefined): treat as clear.
              onChange(date ? toIso(date) : null)
              setOpen(false)
            }}
          />
        </div>
      )}
      {error && <p className="text-meta font-semibold text-ink">{error}</p>}
    </div>
  )
}

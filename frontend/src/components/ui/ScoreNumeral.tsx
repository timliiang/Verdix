import { cn } from "../../lib/utils"

const sizes = {
  lg: { value: "text-score", scale: "text-meta" },
  md: { value: "text-display-sm", scale: "text-meta" },
  sm: { value: "text-heading-sm", scale: "text-micro-caps" },
} as const

const tones = {
  light: { value: "text-ink", scale: "text-stone" },
  dark: { value: "text-on-action", scale: "text-ash" },
  // The accent as text: ink in DESIGN.md, amber on the light home theme, yellow on dark surfaces.
  accent: { value: "text-highlight", scale: "text-stone" },
} as const

interface ScoreNumeralProps {
  score: number
  size?: keyof typeof sizes
  tone?: keyof typeof tones
  className?: string
}

// The 0-10 Verdix score. Regular weight with tight tracking like every DESIGN.md display size;
// tabular figures keep columns of scores aligned.
export function ScoreNumeral({ score, size = "lg", tone = "light", className }: ScoreNumeralProps) {
  const s = sizes[size]
  const t = tones[tone]
  return (
    <span className={cn("inline-flex items-baseline gap-1 tabular-nums", className)}>
      <span className={cn(s.value, t.value)}>{score.toFixed(1)}</span>
      <span className={cn(s.scale, t.scale)}>/10</span>
    </span>
  )
}

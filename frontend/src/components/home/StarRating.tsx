import { Star } from "lucide-react"
import { cn } from "../../lib/utils"

interface StarRatingProps {
  rating: number
  max?: number
  className?: string
  size?: number
  showValue?: boolean
}

export function StarRating({ rating, max = 5, className, size = 14, showValue = false }: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div
        className="relative inline-flex"
        role="img"
        aria-label={`Rated ${rating.toFixed(1)} out of ${max} stars`}
      >
        {/* Empty track */}
        <div className="flex text-muted-foreground/40">
          {Array.from({ length: max }).map((_, i) => (
            <Star key={i} width={size} height={size} className="fill-current" />
          ))}
        </div>
        {/* Filled overlay clipped to the rating percentage */}
        <div
          className="absolute inset-0 flex overflow-hidden text-primary"
          style={{ width: `${(rating / max) * 100}%` }}
        >
          {Array.from({ length: max }).map((_, i) => (
            <Star key={i} width={size} height={size} className="shrink-0 fill-current" />
          ))}
        </div>
      </div>
      {showValue && <span className="text-xs font-semibold text-foreground/90">{rating.toFixed(1)}</span>}
    </div>
  )
}

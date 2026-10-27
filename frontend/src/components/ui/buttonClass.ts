import { cn } from "../../lib/utils"

// DESIGN.md: one pill at every scale. 40px tall, grows to 48px on touch-sized screens.
// skin: the themed home page follows the original "/" instead: 12px corners, a lifted surface for secondary
// actions; dark surfaces add the accent glow on hover (night:).
const variants = {
  primary:
    "h-12 sm:h-10 px-6 rounded-full bg-action text-on-action hover:bg-ink-soft skin:rounded-xl skin:px-5 skin:hover:bg-action skin:hover:brightness-105 night:hover:glow-action",
  "primary-on-dark": "h-12 sm:h-10 px-6 rounded-full bg-on-action text-action hover:bg-hairline",
  ghost:
    "h-12 sm:h-10 px-6 rounded-full border border-ink bg-canvas text-ink hover:bg-hairline skin:rounded-xl skin:px-5 skin:border-hairline-soft skin:bg-hairline skin:hover:bg-surface-cool",
  "text-link": "rounded-inline px-1 py-1 text-link-sm text-ink underline-offset-4 hover:underline active:underline",
} as const

export type ButtonVariant = keyof typeof variants

// Kept out of Button.tsx so that file exports only components (React Fast Refresh requirement).
// Lets a router <Link> look like a button without nesting <button> inside <a>.
export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cn(
    "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-button transition duration-150",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
    "active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40",
    variants[variant],
    className,
  )
}

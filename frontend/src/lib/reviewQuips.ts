import type { ApiError } from "../api/apiError"

// The funny lines on review toasts. The joke is always the title; the body says plainly what
// happened, so the notification still informs when the joke doesn't land (and for screen readers).
// Errors keep the real, parsed message as their body: the quip softens it, never replaces it.

interface Quip {
  title: string
  body: string
}

const CREATED: Quip[] = [
  { title: "That's a wrap!", body: "Your review is live. Somewhere, a director just felt a chill." },
  { title: "Verdict delivered.", body: "The jury (you) has spoken. Your review is posted." },
  { title: "Popcorn: earned.", body: "Your review is up for every Verdix member to see." },
  { title: "Critic mode: activated.", body: "Your review is posted. Try not to let the power go to your head." },
  { title: "And scene!", body: "Your review just premiered on Verdix." },
]

const UPDATED: Quip[] = [
  { title: "Director's cut saved.", body: "Your review has been re-edited for theatrical release." },
  { title: "Reshoots complete.", body: "Your updated review is live." },
  { title: "Now remastered in 4K.", body: "Your changes are saved." },
  { title: "Second opinion, same critic.", body: "Your review is updated." },
]

const DELETED: Quip[] = [
  { title: "Left on the cutting room floor.", body: "Your review is deleted." },
  { title: "Fade to black.", body: "Your review is gone, and the score has been recalculated." },
]

const FAILED_TITLES = [
  "Plot twist: that didn't work.",
  "The projector jammed.",
  "Cut! That take didn't land.",
  "We lost the reel.",
]

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

export const reviewQuips = {
  created: () => pick(CREATED),
  updated: () => pick(UPDATED),
  deleted: () => pick(DELETED),
  failed: (error: ApiError): Quip => ({
    // A second review of the same film gets its own joke; everything else a random flop.
    title: error.kind === "conflict" ? "Sequel denied." : pick(FAILED_TITLES),
    body: error.message,
  }),
}

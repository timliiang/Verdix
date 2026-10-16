import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Teach tailwind-merge the custom @theme scales in index.css. Without this it reads
// `text-display` as a colour and drops it when merged with `text-ink`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'display', 'display-sm', 'heading-md', 'heading-sm', 'subtitle', 'body', 'body-tight',
        'link-sm', 'eyebrow', 'meta', 'micro-caps', 'button', 'score',
      ],
      radius: ['inline', 'chip', 'media', 'panel'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

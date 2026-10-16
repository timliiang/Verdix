import { useCallback, useState } from "react"

export type Theme = "light" | "dark"

const STORAGE_KEY = "verdix-theme"

// Saved choice first, then the OS preference. Read in the lazy initializer so the very first render
// is already in the right theme (no flash of the wrong one). Only an explicit toggle is saved:
// persisting on load would freeze the OS preference as if the user had chosen it.
function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === "light" || saved === "dark") return saved
  } catch {
    // Storage can be unavailable (private mode, blocked site data). Fall through to the OS preference.
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "light" ? "dark" : "light"
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // Not persisted; the toggle still works for this visit.
      }
      return next
    })
  }, [])

  return { theme, toggleTheme }
}

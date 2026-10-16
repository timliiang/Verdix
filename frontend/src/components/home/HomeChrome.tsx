import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Bell, Bookmark, Clapperboard, Home, Menu, Moon, Search, Settings, Sparkles, Star, Sun, User, X } from "lucide-react"
import { cn } from "../../lib/utils"
import { initials } from "../../lib/format"
import type { Theme } from "./useTheme"

const navItems = [
  { label: "Home", icon: Home, to: "/", active: true },
  { label: "Watchlist", icon: Bookmark, to: "#", active: false },
  { label: "Reviews", icon: Star, to: "#reviews", active: false },
  { label: "Profile", icon: User, to: "#", active: false },
  { label: "Settings", icon: Settings, to: "#", active: false },
]

const iconButton =
  "grid size-10 shrink-0 place-items-center rounded-xl border border-hairline-soft bg-hairline text-slate transition-colors hover:text-ink"

function LogoMark() {
  return (
    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-action text-on-action night:glow-action">
      <Clapperboard className="size-5" strokeWidth={1.75} aria-hidden="true" />
    </span>
  )
}

function Wordmark() {
  return <span className="text-heading-sm font-bold tracking-tight text-ink night:text-glow-action">Verdix</span>
}

function PremiumButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={cn(
        "group inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full border border-action/50 bg-action/15 px-4 text-button text-highlight transition",
        "hover:bg-action hover:text-on-action night:hover:glow-action",
        className,
      )}
    >
      <Sparkles className="size-4 transition-transform group-hover:scale-110" strokeWidth={1.75} aria-hidden="true" />
      Go Premium
    </button>
  )
}

function SearchField({ className }: { className?: string }) {
  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">Search films, reviews and people</span>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate" aria-hidden="true" />
      <input
        type="search"
        placeholder="Search films"
        className="h-10 w-full rounded-xl border border-hairline-soft bg-hairline pl-10 pr-4 text-link-sm font-normal text-ink outline-none transition-[width,border-color] placeholder:text-slate focus:border-highlight/60"
      />
    </label>
  )
}

interface HomeNavProps {
  theme: Theme
  onToggleTheme: () => void
}

// Structure follows the original v0 home nav: logo tile, five links with an active underline,
// search, Premium, notifications, avatar, and a slide-out drawer below md; plus the theme toggle.
// Breakpoints keep the bar on one line at every width:
//   < sm  logo, toggle, bell, avatar, menu (search moves into the drawer)
//   sm    + search icon        md  links replace the menu (tighter link padding until lg)
//   lg    + Go Premium         xl  the search icon becomes a field
export function HomeNav({ theme, onToggleTheme }: HomeNavProps) {
  const [open, setOpen] = useState(false)
  const next = theme === "light" ? "dark" : "light"

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  // The drawer is a sibling of the header, not a child: the header's backdrop-filter makes it the
  // containing block for fixed descendants, which would clip "fixed inset-0" to the 64px bar.
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-hairline-soft bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-page items-center gap-4 px-4 sm:px-6 lg:px-12">
          <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Verdix home">
            <LogoMark />
            <Wordmark />
          </Link>
  
          <nav aria-label="Primary" className="hidden items-center md:flex lg:ml-2 lg:gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "relative rounded-lg px-2.5 py-2 text-link-sm transition-colors lg:px-3",
                  item.active ? "text-ink" : "text-slate hover:text-ink",
                )}
              >
                {item.label}
                {item.active && (
                  <span aria-hidden="true" className="absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-highlight night:glow-action lg:inset-x-3" />
                )}
              </Link>
            ))}
          </nav>
  
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <SearchField className="hidden w-48 xl:block [&:focus-within]:w-64" />
            <button type="button" className={cn(iconButton, "hidden sm:grid xl:hidden")} aria-label="Search">
              <Search className="size-5" strokeWidth={1.75} />
            </button>
  
            <PremiumButton className="hidden lg:inline-flex" />
  
            <button
              type="button"
              onClick={onToggleTheme}
              className={iconButton}
              aria-label={`Switch to ${next} theme`}
              title={`Switch to ${next} theme`}
            >
              {theme === "light" ? <Moon className="size-5" strokeWidth={1.75} /> : <Sun className="size-5" strokeWidth={1.75} />}
            </button>
  
            <button type="button" className={cn(iconButton, "relative")} aria-label="Notifications, 1 unread">
              <Bell className="size-5" strokeWidth={1.75} />
              <span aria-hidden="true" className="absolute right-2.5 top-2.5 size-2 rounded-full bg-action ring-2 ring-hairline" />
            </button>
  
            <button
              type="button"
              aria-label="Your profile"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-action text-button text-on-action ring-2 ring-transparent transition hover:ring-action/40"
            >
              YO
            </button>
  
            <button
              type="button"
              className={cn(iconButton, "md:hidden")}
              aria-expanded={open}
              aria-controls="home-drawer"
              aria-label="Open navigation menu"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div id="home-drawer" className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-scrim/60 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col border-l border-hairline-soft bg-hairline p-5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg text-slate hover:bg-surface-cool hover:text-ink"
              aria-label="Close navigation menu"
            >
              <X className="size-5" strokeWidth={1.75} />
            </button>
            <div className="flex items-center gap-2.5 px-2 py-1">
              <LogoMark />
              <Wordmark />
            </div>
            <SearchField className="mt-6 sm:hidden" />
            <nav aria-label="Mobile primary" className="mt-6 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  aria-current={item.active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-link-sm transition-colors",
                    item.active ? "bg-action/15 text-highlight" : "text-slate hover:bg-surface-cool hover:text-ink",
                  )}
                >
                  <item.icon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <PremiumButton className="mt-auto w-full justify-center" />
          </div>
        </div>
      )}
    </>
  )
}

// Follows the page theme. The theme switch lives in the nav, so the footer no longer repeats it.
export function HomeFooter() {
  return (
    <footer className="border-t border-hairline-soft bg-footer py-section text-ink">
      {/* Padding inside the max-width box, like every section, so the footer shares their left edge. */}
      <div className="mx-auto flex max-w-page flex-col gap-3 px-4 sm:px-6 lg:px-12">
        <span className="flex items-center gap-2.5">
          <LogoMark />
          <Wordmark />
        </span>
        <p className="text-meta text-ash">Rank every film you watch.</p>
      </div>
    </footer>
  )
}

// The gradient avatar from the original "/". Reviewers have no photos in the data; the gradient
// classes are literal strings in homeData, so Tailwind generates them.
export function Monogram({ name, avatarColor, className }: { name: string; avatarColor: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br text-micro-caps font-bold text-on-action", avatarColor, className)}
    >
      {initials(name)}
    </span>
  )
}

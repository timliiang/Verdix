import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Bell, Menu, Moon, Search, Sun, X } from "lucide-react"
import { cn } from "../../lib/utils"
import { initials } from "../../lib/format"
import { ProfileMenu } from "./ProfileMenu"
import { DrawerSearch, NavSearch } from "../search/NavSearch"
import type { Theme } from "./useTheme"

// The active link is derived from the URL, so the underline follows the page instead of always
// marking Home. Routes other than "/" are not registered in App.tsx yet.
const navItems = [
  { label: "Home", to: "/" },
  { label: "Watchlist", to: "/watchlist" },
  { label: "Reviews", to: "/reviews" },
  { label: "Profile", to: "/profile" },
  { label: "Settings", to: "/settings" },
]

// Hover lifts the tile 2px, warms its edge and nudges the icon up in size; colour only under reduced motion.
const iconButton = cn(
  "grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-hairline-soft bg-hairline text-slate transition duration-200",
  "hover:-translate-y-0.5 hover:border-highlight/40 hover:text-ink",
  "[&_svg]:transition-transform [&_svg]:duration-200 hover:[&_svg]:scale-110",
  "motion-reduce:hover:translate-y-0 motion-reduce:hover:[&_svg]:scale-100",
)

function Wordmark() {
  return (
    <span translate="no" className="text-heading-sm font-bold tracking-tight text-ink night:text-glow-action">
      Verdix
    </span>
  )
}

interface HomeNavProps {
  theme: Theme
  onToggleTheme: () => void
  // "minimal" is for signed-out screens (log in, register): wordmark and theme toggle only, since
  // links to Watchlist or Profile, notifications and an avatar mean nothing before you sign in.
  variant?: "full" | "minimal"
}

// Structure follows the original v0 home nav: logo tile, five links with an active underline,
// search, notifications, avatar, and a slide-out drawer below md; plus the theme toggle.
// Breakpoints keep the bar on one line at every width:
//   < sm  logo, toggle, bell, avatar, menu (search moves into the drawer)
//   sm    + search icon        md  links replace the menu (tighter link padding until lg)
//   lg         xl  the search icon becomes a field
export function HomeNav({ theme, onToggleTheme, variant = "full" }: HomeNavProps) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const full = variant === "full"
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
      {/* Skip link: hidden until focused, so keyboard users can jump past the nav. Pages give their
          <main> id="main". */}
      <a
        href="#main"
        className="sr-only z-50 rounded-xl bg-action px-4 py-2 text-button text-on-action focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-hairline-soft bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-page items-center gap-4 px-4 sm:px-6 lg:px-12">
          <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Verdix home">
            <Wordmark />
          </Link>
  
          {full && (
          <nav aria-label="Primary" className="hidden items-center md:flex lg:ml-2 lg:gap-1">
            {navItems.map((item) => {
              const active = item.to === pathname
              return (
              <Link
                key={item.label}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative rounded-lg px-2.5 py-2 text-link-sm transition-colors lg:px-3",
                  active ? "text-ink" : "text-slate hover:text-ink",
                )}
              >
                {item.label}
                {/* Always rendered: the active link shows it, others grow it from the centre on hover.
                    Scaling a transform, not width, so the animation never triggers layout. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-highlight transition-transform duration-300 ease-out motion-reduce:transition-none lg:inset-x-3",
                    active ? "scale-x-100 night:glow-action" : "scale-x-0 opacity-60 group-hover:scale-x-100",
                  )}
                />
              </Link>
              )
            })}
          </nav>
          )}
  
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {full && (
              <>
                <NavSearch className="hidden w-48 transition-[width] duration-200 xl:block [&:focus-within]:w-64" />
                <Link to="/search" className={cn(iconButton, "hidden sm:grid xl:hidden")} aria-label="Search">
                  <Search className="size-5" strokeWidth={1.75} />
                </Link>
              </>
            )}
  
            <button
              type="button"
              onClick={onToggleTheme}
              className={iconButton}
              aria-label={`Switch to ${next} theme`}
              title={`Switch to ${next} theme`}
            >
              {theme === "light" ? <Moon className="size-5" strokeWidth={1.75} /> : <Sun className="size-5" strokeWidth={1.75} />}
            </button>
  
            {full && (
            <>
            <Link to="/notifications" className={cn(iconButton, "relative")} aria-label="Notifications, 1 unread">
              <Bell className="size-5" strokeWidth={1.75} />
              <span aria-hidden="true" className="absolute right-2.5 top-2.5 size-2 rounded-full bg-action ring-2 ring-hairline" />
            </Link>

            <ProfileMenu />
  
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
            </>
            )}
          </div>
        </div>
      </header>

      {full && open && (
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
              <Wordmark />
            </div>
            <DrawerSearch className="mt-6 sm:hidden" onDone={() => setOpen(false)} />
            <nav aria-label="Mobile primary" className="mt-6 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  aria-current={item.to === pathname ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-link-sm transition-colors",
                    item.to === pathname ? "bg-action/15 text-highlight" : "text-slate hover:bg-surface-cool hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
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

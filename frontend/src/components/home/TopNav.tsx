import { useState } from "react"
import { Link } from "react-router-dom"
import { Home, Bookmark, Star, User, Settings, Clapperboard, Menu, X, Search, Bell, Sparkles } from "lucide-react"
import { cn } from "../../lib/utils"

const navItems = [
  { label: "Home", icon: Home, active: true, to: "/" },
  { label: "Watchlist", icon: Bookmark, active: false, to: "#" },
  { label: "Reviews", icon: Star, active: false, to: "#" },
  { label: "Profile", icon: User, active: false, to: "#" },
  { label: "Settings", icon: Settings, active: false, to: "#" },
]

function PremiumButton({ className }: { className?: string }) {
  return (
    <button
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:glow-accent",
        className,
      )}
    >
      <Sparkles className="size-3.5 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
      Go Premium
    </button>
  )
}

export function TopNav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Verdix home">
          <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground glow-accent">
            <Clapperboard className="size-5" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold tracking-tight text-glow">Verdix</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
                item.active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
              {item.active && (
                <span
                  className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-primary drop-shadow-[0_0_6px_var(--primary)]"
                  aria-hidden="true"
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Search — collapses to icon on small screens */}
          <div className="relative hidden lg:block">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search..."
              aria-label="Search movies, reviews, people"
              className="w-44 rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-all duration-200 focus:w-64 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            className="grid size-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground lg:hidden"
            aria-label="Search"
          >
            <Search className="size-5" />
          </button>

          <PremiumButton className="hidden sm:inline-flex" />

          <button
            className="relative grid size-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            <span
              className="absolute right-2.5 top-2.5 size-2 rounded-full bg-primary ring-2 ring-card"
              aria-hidden="true"
            />
          </button>

          <button
            className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 text-sm font-bold text-black ring-2 ring-transparent transition-all duration-200 hover:ring-primary/50"
            aria-label="Your profile"
          >
            YO
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(true)}
            className="grid size-10 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:text-foreground md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 flex h-full w-72 flex-col bg-sidebar p-5 shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
              aria-label="Close navigation menu"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2.5 px-2 py-1">
              <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground glow-accent">
                <Clapperboard className="size-5" aria-hidden="true" />
              </div>
              <span className="text-base font-bold tracking-tight text-glow">Verdix</span>
            </div>

            <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile primary">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  aria-current={item.active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    item.active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-[18px] transition-transform duration-200 group-hover:scale-110",
                      item.active && "drop-shadow-[0_0_8px_var(--primary)]",
                    )}
                    aria-hidden="true"
                  />
                  {item.label}
                </Link>
              ))}
            </nav>

            <PremiumButton className="mt-auto w-full justify-center py-2.5" />
          </div>
        </div>
      )}
    </header>
  )
}

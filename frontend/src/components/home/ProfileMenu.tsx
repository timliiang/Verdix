import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Bookmark, LogIn, LogOut, MessageSquareText, Settings, User, UserPlus } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { initials } from "../../lib/format"
import { cn } from "../../lib/utils"

const ease = [0.16, 1, 0.3, 1] as const

const accountLinks = [
  { label: "Profile", to: "/profile", icon: User },
  { label: "Watchlist", to: "/watchlist", icon: Bookmark },
  { label: "Your reviews", to: "/reviews", icon: MessageSquareText },
  { label: "Settings", to: "/settings", icon: Settings },
]

const guestLinks = [
  { label: "Log in", to: "/login", icon: LogIn },
  { label: "Create account", to: "/register", icon: UserPlus },
]

const itemClass =
  "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-link-sm text-slate outline-none transition-colors hover:bg-surface-cool hover:text-ink focus-visible:bg-surface-cool focus-visible:text-ink"

function menuItems(menu: HTMLElement | null) {
  return Array.from(menu?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
}

// The avatar button and its account menu. Follows the ARIA menu-button pattern: focus moves into the
// menu on open, arrows/Home/End move between items, Escape closes and returns focus to the avatar,
// Tab or a click outside closes it.
export function ProfileMenu() {
  const { username, logout } = useAuth()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    menuItems(menuRef.current)[0]?.focus()
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open])

  const closeAndRefocus = () => {
    setOpen(false)
    buttonRef.current?.focus()
  }

  const onButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setOpen(true)
    }
  }

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = menuItems(menuRef.current)
    const index = items.indexOf(document.activeElement as HTMLElement)
    const focusAt = (i: number) => items[(i + items.length) % items.length]?.focus()

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        focusAt(index + 1)
        break
      case "ArrowUp":
        e.preventDefault()
        focusAt(index <= 0 ? -1 : index - 1)
        break
      case "Home":
        e.preventDefault()
        focusAt(0)
        break
      case "End":
        e.preventDefault()
        focusAt(-1)
        break
      case "Escape":
        e.preventDefault()
        closeAndRefocus()
        break
      case "Tab":
        setOpen(false)
        break
    }
  }

  const signOut = () => {
    logout()
    setOpen(false)
    navigate("/", { replace: true })
  }

  const links = username ? accountLinks : guestLinks

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={username ? `Account menu for ${username}` : "Account menu"}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onButtonKeyDown}
        className={cn(
          "grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-action text-button text-on-action ring-2 transition duration-200",
          "hover:scale-105 hover:ring-action/40 motion-reduce:hover:scale-100",
          open ? "ring-action/40" : "ring-transparent",
        )}
      >
        {username ? initials(username) : <User className="size-5" strokeWidth={1.75} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease }}
            onKeyDown={onMenuKeyDown}
            className="absolute right-0 top-full z-50 mt-2 w-60 origin-top-right rounded-2xl border border-hairline-soft bg-hairline p-1.5 shadow-2xl shadow-canvas/60"
          >
            {username && (
              <div className="px-3 pb-2 pt-1.5">
                <p className="text-meta text-slate">Signed in as</p>
                <p className="truncate text-link-sm text-ink">{username}</p>
              </div>
            )}
            <div ref={menuRef} id={menuId} role="menu" aria-label="Account" className="flex flex-col">
              {username && <div role="separator" className="mx-1.5 mb-1.5 h-px bg-hairline-soft" />}
              {links.map(({ label, to, icon: Icon }) => (
                <Link key={to} to={to} role="menuitem" tabIndex={-1} onClick={() => setOpen(false)} className={itemClass}>
                  <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                  {label}
                </Link>
              ))}
              {username && (
                <>
                  <div role="separator" className="mx-1.5 my-1.5 h-px bg-hairline-soft" />
                  <button type="button" role="menuitem" tabIndex={-1} onClick={signOut} className={itemClass}>
                    <LogOut className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                    Sign out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

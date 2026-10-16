import { Link } from "react-router-dom"

const sectionLinks = [
  { label: "Ranking", href: "#ranking" },
  { label: "Films", href: "#films" },
  { label: "How It Works", href: "#how" },
]

export function LandingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-night/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center gap-6 px-4 sm:px-8 lg:px-12">
        <Link to="/" translate="no" className="text-[22px] tracking-[-0.04em] text-paper" aria-label="Verdix home">
          verdix
        </Link>

        <nav aria-label="Page sections" className="hidden flex-1 justify-center gap-1 md:flex">
          {sectionLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm text-fog transition-colors duration-200 hover:text-paper"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Link
            to="/login"
            className="rounded-full px-3 py-2 text-sm font-semibold text-paper transition-colors duration-200 hover:text-fog"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="inline-flex h-10 items-center rounded-full bg-paper px-5 text-sm font-semibold text-night transition-[transform,background-color] duration-200 hover:bg-white active:scale-[0.98]"
          >
            Join Verdix
          </Link>
        </div>
      </div>
    </header>
  )
}

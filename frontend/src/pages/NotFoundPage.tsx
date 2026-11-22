import "@fontsource-variable/geist"
import { Link, useLocation } from "react-router-dom"
import { buttonClass } from "../components/ui/buttonClass"
import { Reveal } from "../components/home/Reveal"
import { HomeFooter, HomeNav } from "../components/home/HomeChrome"
import { useTheme } from "../components/home/useTheme"

// Rendered by the catch-all route for any URL no other route matches, including nav links to pages
// that are not built yet. Same theme root, nav and glow as the home page, so the way back is right there.
export default function NotFoundPage() {
  const { theme, toggleTheme } = useTheme()
  const { pathname } = useLocation()

  return (
    <div data-theme={theme} className="flex min-h-[100dvh] flex-col font-display text-ink antialiased">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-0 size-96 rounded-full bg-action/10 blur-[120px]" />
        <div className="absolute -right-40 top-1/2 size-96 rounded-full bg-action/5 blur-[140px]" />
      </div>

      <HomeNav theme={theme} onToggleTheme={toggleTheme} />

      <main id="main" className="mx-auto flex w-full max-w-page flex-1 items-center px-4 py-section sm:px-6 lg:px-12">
        <title>Page not found | Verdix</title>
        <Reveal className="max-w-xl">
          <p className="text-eyebrow uppercase text-highlight">Error 404</p>
          <h1 className="mt-4 text-balance text-display-sm font-bold text-ink sm:text-display">This scene was cut.</h1>
          <p className="mt-5 text-body text-graphite">
            There is nothing at{" "}
            <span className="break-all rounded-md bg-hairline px-1.5 py-0.5 text-link-sm text-ink">{pathname}</span>.
            The link may be wrong, or this page has not been built yet.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/" className={buttonClass("primary")}>
              Back to home
            </Link>
            <Link to="/movies" className={buttonClass("ghost")}>
              Browse films
            </Link>
          </div>
        </Reveal>
      </main>

      <HomeFooter />
    </div>
  )
}

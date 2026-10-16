import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

const footerLinks = [
  { label: "Films", to: "/movies", external: false },
  { label: "Log In", to: "/login", external: false },
  { label: "GitHub", to: "https://github.com/timliiang/Verdix", external: true },
]

export function ClosingCta() {
  return (
    <>
      <section aria-labelledby="cta-title" className="mx-auto w-full max-w-[1280px] px-4 py-24 sm:px-8 lg:px-12 lg:py-36">
        <div className="flex flex-col items-start gap-8">
          <h2 id="cta-title" className="max-w-[16ch] text-balance text-[44px] leading-[1] tracking-[-0.035em] text-paper sm:text-[64px]">
            Start your list with the last film you saw.
          </h2>
          <Link
            to="/register"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-paper px-6 text-sm font-semibold text-night transition-[transform,background-color] duration-200 hover:bg-white active:scale-[0.98]"
          >
            Join Verdix
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>

      <footer className="border-t border-rule">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 py-12 sm:flex-row sm:items-end sm:justify-between sm:px-8 lg:px-12">
          <div className="flex flex-col gap-3">
            <span translate="no" className="text-[22px] tracking-[-0.04em] text-paper">
              verdix
            </span>
            <p className="text-[13px] text-haze">
              Film data from{" "}
              <a
                href="https://www.themoviedb.org/"
                className="text-fog underline-offset-4 hover:text-paper hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                TMDB
              </a>
              . Not endorsed or certified by TMDB.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-6">
            {footerLinks.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.to}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-fog transition-colors duration-200 hover:text-paper"
                >
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} to={link.to} className="text-sm text-fog transition-colors duration-200 hover:text-paper">
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      </footer>
    </>
  )
}

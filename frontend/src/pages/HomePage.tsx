import "@fontsource-variable/geist"
import { Link } from "react-router-dom"
import { motion, useReducedMotion } from "motion/react"
import { Clock, Flame, PenLine, Star, Trophy, UserPlus } from "lucide-react"
import { buttonClass } from "../components/ui/buttonClass"
import { ScoreNumeral } from "../components/ui/ScoreNumeral"
import { FilmCard } from "../components/ui/FilmCard"
import { Reveal } from "../components/home/Reveal"
import { HomeFooter, HomeNav, Monogram } from "../components/home/HomeChrome"
import { useTheme } from "../components/home/useTheme"
import { cn } from "../lib/utils"
import { featuredFilm, formatNumber, rankedThisWeek, recentReviews, reviewersToFollow } from "../lib/homeContent"

const ease = [0.16, 1, 0.3, 1] as const

const chip = "rounded-full bg-canvas/60 px-2.5 py-1 text-meta text-ink-soft ring-1 ring-inset ring-ink/10 backdrop-blur-sm"

// Verdix home, "Cinema" direction in the skin of the original "/": a contained photographic hero card,
// a poster rail, a reviews bento and the Top Reviewers card. Motion: the backdrop settles in once on
// load, like house lights going down; sections rise into view as you reach them.
//
// One structure, two palettes. data-theme on the root picks light or dark tokens (index.css) and the
// toggle in the nav flips it. The photo hero and lead review are data-surface="stage": always the
// night palette, because white copy sits on a dark photo in either theme.
export default function HomePage() {
  const reduce = useReducedMotion()
  const { theme, toggleTheme } = useTheme()
  const [lead, ...rest] = recentReviews

  return (
    <div data-theme={theme} className="min-h-[100dvh] font-display text-ink antialiased">
      {/* Ambient accent glow from "/". Fixed behind the content; the html element paints the canvas. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-0 size-96 rounded-full bg-action/10 blur-[120px]" />
        <div className="absolute -right-40 top-1/2 size-96 rounded-full bg-action/5 blur-[140px]" />
      </div>

      <HomeNav theme={theme} onToggleTheme={toggleTheme} />

      <main>
        {/* Hero: a contained photo card, as on "/". */}
        <div className="mx-auto max-w-page px-4 pt-6 sm:px-6 lg:px-12">
          <section
            data-surface="stage"
            aria-labelledby="home-hero"
            className="relative isolate flex items-end overflow-hidden rounded-2xl border border-hairline-soft bg-scrim"
          >
            <motion.img
              src={featuredFilm.backdropUrl}
              alt=""
              fetchPriority="high"
              className="absolute inset-0 -z-10 h-full w-full object-cover object-[50%_60%]"
              initial={reduce ? false : { scale: 1.08, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.6, ease }}
            />
            {/* Legibility scrims, not decoration: a floor under the copy, and the side-light from "/".
                Phones hold the dark stop higher because the copy sits mid-frame there. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-gradient-to-t from-canvas from-40% via-canvas/75 via-65% to-canvas/20 sm:from-0% sm:via-canvas/50 sm:via-50% sm:to-canvas/10"
            />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-canvas/90 via-canvas/50 to-transparent" />

            <motion.div
              className="grid w-full grid-cols-1 gap-10 px-6 pb-8 pt-40 sm:px-10 sm:pb-10 sm:pt-56 lg:grid-cols-[1fr_auto] lg:items-end"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease }}
            >
              <div className="flex max-w-2xl flex-col gap-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas/60 px-3 py-1 text-link-sm text-highlight ring-1 ring-action/40 backdrop-blur-sm">
                    <Flame className="size-3.5" aria-hidden="true" />
                    Most ranked this week
                  </span>
                  <span className={chip}>{featuredFilm.genre}</span>
                  <span className={chip}>{featuredFilm.year}</span>
                  <span className={cn(chip, "inline-flex items-center gap-1")}>
                    <Clock className="size-3.5" aria-hidden="true" />
                    {featuredFilm.runtime}
                  </span>
                </div>
                <h1 id="home-hero" className="text-display-sm font-bold text-ink sm:text-display night:text-glow-action">
                  {featuredFilm.title}
                </h1>
                <p className="max-w-[46ch] text-body text-graphite">{featuredFilm.synopsis}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Link to="/movies" className={buttonClass("primary")}>
                    <PenLine className="size-4" aria-hidden="true" />
                    Rank this film
                  </Link>
                  <a
                    href="#reviews"
                    className={buttonClass(
                      "text-link",
                      "h-12 rounded-xl border border-hairline-soft bg-ink/5 px-5 text-button backdrop-blur hover:bg-ink/10 hover:no-underline sm:h-10",
                    )}
                  >
                    Read reviews
                  </a>
                </div>
              </div>
              <div className="flex flex-col gap-2 border-t border-ink/10 pt-6 lg:items-end lg:border-t-0 lg:pt-0">
                <ScoreNumeral score={featuredFilm.score} tone="accent" className="night:text-glow-action" />
                <p className="inline-flex items-center gap-1.5 text-meta text-ash">
                  <Star className="size-3.5 fill-highlight text-highlight" aria-hidden="true" />
                  Average of {formatNumber(featuredFilm.rankings)} lists
                </p>
              </div>
            </motion.div>
          </section>
        </div>

        {/* Poster rail: six-up grid at xl, a swipeable snap rail below it. */}
        <section id="ranked" aria-labelledby="home-ranked" className="py-section">
          <div className="mx-auto flex max-w-page items-baseline justify-between gap-6 px-4 sm:px-6 lg:px-12">
            <h2 id="home-ranked" className="text-heading-md font-bold text-ink">
              Ranked this week
            </h2>
            <Link to="/movies" className={buttonClass("text-link", "shrink-0 text-highlight")}>
              All films
            </Link>
          </div>
          <ol className="no-scrollbar mx-auto mt-10 flex max-w-page snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 pt-1 sm:scroll-px-6 sm:px-6 lg:scroll-px-12 lg:px-12 xl:grid xl:grid-cols-6 xl:overflow-visible">
            {rankedThisWeek.map((film, i) => (
              <li key={film.id} className="w-[64vw] max-w-[240px] shrink-0 snap-start xl:w-auto xl:max-w-none">
                <Reveal delay={i * 0.06} className="h-full">
                  <FilmCard film={film} scorePlacement="below" />
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        {/* Reviews bento: one photographic panel holds the lead quote, three tiles hold the rest.
            Four reviews, four cells. Mobile: a single column, panel first. */}
        <section id="reviews" aria-labelledby="home-reviews" className="mx-auto max-w-page px-4 pb-section sm:px-6 lg:px-12">
          <h2 id="home-reviews" className="text-heading-md font-bold text-ink">
            Recent reviews
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:grid-rows-3">
            <Reveal className="lg:col-span-2 lg:row-span-3">
              <figure
                data-surface="stage"
                className="relative isolate flex h-full min-h-[420px] flex-col justify-end overflow-hidden rounded-2xl border border-hairline-soft bg-scrim p-6 sm:p-12"
              >
                <img src="/landing/night-street.jpg" alt="" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover" />
                <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-scrim via-scrim/60 to-scrim/20" />
                <blockquote className="max-w-xl text-heading-sm font-semibold leading-[1.2] text-ink sm:text-heading-md sm:leading-[1.15]">
                  &ldquo;{lead.body}&rdquo;
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3">
                  <Monogram name={lead.author.name} avatarColor={lead.author.avatarColor} />
                  <span className="flex flex-col gap-1">
                    <span className="text-link-sm text-ink">{lead.author.name}</span>
                    <span className="text-meta text-ash">
                      Placed {lead.film.title} at #{lead.placedAt} of {lead.listSize}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
            {rest.map((r, i) => (
              <Reveal key={r.id} delay={0.08 * (i + 1)}>
                <figure className="flex h-full gap-4 rounded-2xl border border-hairline-soft bg-hairline p-4 transition hover:border-action/60">
                  <img src={r.film.posterUrl} alt="" loading="lazy" className="aspect-[2/3] w-16 shrink-0 self-start rounded-md bg-surface-cool object-cover" />
                  <div className="flex min-w-0 flex-col gap-2">
                    <span className="text-link-sm text-ink">{r.film.title}</span>
                    <blockquote className="text-body-tight text-graphite">&ldquo;{r.body}&rdquo;</blockquote>
                    <figcaption className="flex items-center gap-2 text-meta text-slate">
                      <Monogram name={r.author.name} avatarColor={r.author.avatarColor} className="size-5 text-[9px]" />
                      {r.author.name}, #{r.placedAt} of {r.listSize}
                    </figcaption>
                  </div>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Reviewers: heading column with an action beside the "Top Reviewers" card from "/". */}
        <section id="reviewers" aria-labelledby="home-reviewers">
          <div className="mx-auto grid max-w-page grid-cols-1 gap-10 px-4 pb-section sm:px-6 lg:grid-cols-[1fr_2fr] lg:gap-16 lg:px-12">
            <div className="flex flex-col items-start gap-6">
              <h2 id="home-reviewers" className="flex items-center gap-3 text-heading-md font-bold text-ink">
                <Trophy className="size-7 text-highlight" aria-hidden="true" />
                Reviewers to follow
              </h2>
              <p className="max-w-[36ch] text-body text-graphite">Follow people whose taste you trust and their rankings shape what you see.</p>
              <Link to="#" className={buttonClass("ghost")}>
                View leaderboard
              </Link>
            </div>
            <ul className="rounded-2xl border border-hairline-soft bg-hairline p-3">
              {reviewersToFollow.map((r, i) => (
                <li key={r.id} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-cool">
                  <span aria-hidden="true" className="w-4 shrink-0 text-center text-link-sm tabular-nums text-slate">
                    {i + 1}
                  </span>
                  <Monogram name={r.name} avatarColor={r.avatarColor} className="size-10" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-body-tight font-semibold text-ink">{r.name}</span>
                    <span className="text-meta text-slate">@{r.handle}</span>
                  </span>
                  <span className="hidden text-meta tabular-nums text-slate sm:block">{formatNumber(r.followers)} followers</span>
                  <button
                    type="button"
                    aria-label={`Follow ${r.name}`}
                    className="grid size-9 shrink-0 place-items-center rounded-lg border border-hairline-soft text-slate transition-colors hover:border-action/60 hover:bg-action/15 hover:text-highlight"
                  >
                    <UserPlus className="size-4" strokeWidth={1.75} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <HomeFooter />
    </div>
  )
}

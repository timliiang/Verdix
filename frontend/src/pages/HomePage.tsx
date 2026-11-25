import "@fontsource-variable/geist"
import { Link } from "react-router-dom"
import { Trophy, UserPlus } from "lucide-react"
import { buttonClass } from "../components/ui/buttonClass"
import { FeaturedHero } from "../components/home/FeaturedHero"
import { NowPlayingRail } from "../components/home/NowPlayingRail"
import { Reveal } from "../components/home/Reveal"
import { HomeFooter, HomeNav, Monogram } from "../components/home/HomeChrome"
import { useTheme } from "../components/home/useTheme"
import { formatNumber, recentReviews, reviewersToFollow } from "../lib/homeContent"

// Verdix home, "Cinema" direction in the skin of the original "/": a contained photographic hero card,
// a poster rail, a reviews bento and the Top Reviewers card. The hero and rail are live TMDB data
// (Now Playing, refreshed as TMDB's list changes); the reviews and reviewers are still mock data until
// those endpoints exist. Motion: the backdrop settles in once on
// load, like house lights going down; sections rise into view as you reach them.
//
// One structure, two palettes. data-theme on the root picks light or dark tokens (index.css) and the
// toggle in the nav flips it. The photo hero and lead review are data-surface="stage": always the
// night palette, because white copy sits on a dark photo in either theme.
export default function HomePage() {
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

      <main id="main">
        {/* Hero: the #1 film in cinemas right now, live (FeaturedHero, useHomeFilms). */}
        <div className="mx-auto max-w-page px-4 pt-6 sm:px-6 lg:px-12">
          <FeaturedHero />
        </div>

        {/* The rest of TMDB's Now Playing list, from the same live query as the hero. */}
        <NowPlayingRail />

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

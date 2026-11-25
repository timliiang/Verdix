import "@fontsource-variable/geist"
import { useEffect, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { Clapperboard, Loader2, MessageSquareText, RotateCw } from "lucide-react"
import { HomeFooter, HomeNav } from "../components/home/HomeChrome"
import { useTheme } from "../components/home/useTheme"
import { buttonClass } from "../components/ui/buttonClass"
import { FormError } from "../components/ui/FormError"
import { MyReviewCard, MyReviewCardSkeleton } from "../components/reviews/MyReviewCard"
import { SortSelect, SortSidebar } from "../components/reviews/SortPanel"
import { useMyReviewSort, useMyReviews } from "../components/reviews/useMyReviews"
import { parseApiError } from "../api/apiError"
import { myReviewSorts } from "../api/reviewApi"

const countFormat = new Intl.NumberFormat()

// /reviews, signed-in only (inside ProtectedRoute in App.tsx; the API also refuses without a token).
// The member's reviews as a list, highest rated first by default, re-sortable from the sidebar (lg)
// or the select above the list (smaller screens). Same frame as /movies: themed root, ambient glow,
// HomeNav, HomeFooter.
export default function MyReviewsPage() {
  const { theme, toggleTheme } = useTheme()
  const { sort, setSort } = useMyReviewSort()
  const { query, reviews, total } = useMyReviews(sort)
  const sortLabel = myReviewSorts.find((s) => s.value === sort)?.label ?? ""

  useEffect(() => {
    document.title = "Your reviews | Verdix"
    return () => {
      document.title = "Verdix"
    }
  }, [])

  const firstLoad = query.isPending
  const firstPageFailed = query.isError && reviews.length === 0
  // A new sort is loading while the previous order is still shown (placeholderData).
  const resorting = query.isPlaceholderData

  return (
    <div data-theme={theme} className="flex min-h-[100dvh] flex-col font-display text-ink antialiased">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-0 size-96 rounded-full bg-action/10 blur-[120px]" />
        <div className="absolute -right-40 top-1/2 size-96 rounded-full bg-action/5 blur-[140px]" />
      </div>

      <HomeNav theme={theme} onToggleTheme={toggleTheme} />

      <main id="main" className="mx-auto w-full max-w-page flex-1 px-4 pb-section pt-10 sm:px-6 sm:pt-12 lg:px-12">
        <header className="flex flex-col gap-3">
          <h1 className="text-balance text-display-sm font-bold text-ink sm:text-display">Your reviews</h1>
          {/* Announced politely when the count first arrives; quiet otherwise. */}
          <p className="text-meta tabular-nums text-slate" aria-live="polite">
            {query.isSuccess ? `${countFormat.format(total)} ${total === 1 ? "film" : "films"} reviewed` : firstLoad ? "Loading your reviews…" : ""}
          </p>
        </header>

        <div className="mt-8 flex items-start gap-8">
          <div className="hidden lg:block">
            <SortSidebar sort={sort} onChange={setSort} />
          </div>

          <section aria-labelledby="my-reviews-list" className="min-w-0 flex-1">
            <h2 id="my-reviews-list" className="sr-only">
              Reviews, {sortLabel.toLowerCase()}
            </h2>

            <div className="mb-5 flex justify-end lg:hidden">
              <SortSelect sort={sort} onChange={setSort} />
            </div>

            {firstLoad && (
              <ul className="flex flex-col gap-4" aria-busy="true" aria-label="Loading your reviews">
                {[0, 1, 2].map((i) => (
                  <li key={i}>
                    <MyReviewCardSkeleton />
                  </li>
                ))}
              </ul>
            )}

            {firstPageFailed && (
              <StatusPanel
                title="Your reviews could not be loaded"
                body={parseApiError(query.error, { server: "Something went wrong on our side. Try again in a moment." }).message}
                action={
                  <button type="button" onClick={() => query.refetch()} disabled={query.isFetching} className={buttonClass("primary", "disabled:cursor-wait")}>
                    {query.isFetching ? (
                      <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    ) : (
                      <RotateCw className="size-4" aria-hidden="true" />
                    )}
                    {query.isFetching ? "Retrying…" : "Try Again"}
                  </button>
                }
              />
            )}

            {query.isSuccess && reviews.length === 0 && (
              <StatusPanel
                icon={<MessageSquareText className="size-10 text-slate" strokeWidth={1.5} aria-hidden="true" />}
                title="No reviews yet"
                body="Find a film you've seen and rate it. Your reviews collect here, best first."
                action={
                  <Link to="/movies" className={buttonClass("primary")}>
                    Browse Films
                  </Link>
                }
              />
            )}

            {reviews.length > 0 && (
              <>
                {/* Dimmed, not replaced, while a new order loads: the list stays readable and stable. */}
                <ol
                  className={`flex flex-col gap-4 transition-opacity ${resorting ? "opacity-60" : ""}`}
                  aria-busy={resorting || query.isFetchingNextPage}
                >
                  {reviews.map((r, i) => (
                    <li key={r.id}>
                      <MyReviewCard review={r} eager={i < 3} />
                    </li>
                  ))}
                </ol>

                {query.isFetchNextPageError ? (
                  <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-hairline-soft px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                    <FormError message="More reviews could not be loaded." />
                    <button type="button" onClick={() => query.fetchNextPage()} className={buttonClass("ghost", "shrink-0")}>
                      <RotateCw className="size-4" aria-hidden="true" />
                      Try Again
                    </button>
                  </div>
                ) : (
                  query.hasNextPage && (
                    <button
                      type="button"
                      onClick={() => query.fetchNextPage()}
                      disabled={query.isFetchingNextPage}
                      className={buttonClass("ghost", "mt-6 w-full disabled:cursor-wait disabled:opacity-70")}
                    >
                      {query.isFetchingNextPage ? (
                        <>
                          <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                          Loading…
                        </>
                      ) : (
                        "Show More Reviews"
                      )}
                    </button>
                  )
                )}
              </>
            )}
          </section>
        </div>

        {/* TMDB's terms require this notice wherever its data is shown (the posters). */}
        <p className="mt-section max-w-[60ch] text-meta text-ash">
          Film data and posters from{" "}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink" translate="no">
            TMDB
          </a>
          . This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </main>

      <HomeFooter />
    </div>
  )
}

function StatusPanel({ title, body, action, icon }: { title: string; body: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-hairline-soft px-6 py-16 text-center">
      {icon ?? <Clapperboard className="size-10 text-slate" strokeWidth={1.5} aria-hidden="true" />}
      <div className="flex flex-col gap-2">
        <h3 className="text-heading-sm font-semibold text-ink">{title}</h3>
        <p className="max-w-[44ch] text-body text-graphite">{body}</p>
      </div>
      {action}
    </div>
  )
}

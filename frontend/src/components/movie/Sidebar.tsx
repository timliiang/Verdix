import { ExternalLink, Star } from "lucide-react"
import { ScoreNumeral } from "../ui/ScoreNumeral"
import { panel } from "./Section"
import { cn } from "../../lib/utils"
import { formatLongDate, formatRuntime } from "../../lib/format"
import { languageName, regionName } from "../../lib/region"
import { logoUrl } from "../../lib/tmdbImage"
import type { MovieDetail, Provider, RatingSummary } from "../../lib/movieTypes"

const countFormat = new Intl.NumberFormat()
const reviewsLabel = (n: number) => `${countFormat.format(n)} ${n === 1 ? "review" : "reviews"}`

// The Verdix score: the median of members' 1-10 scores (half rated it higher, half lower), so a
// few extreme scores cannot swing it. The bars show the spread a single number hides.
export function RatingPanel({ rating, title }: { rating: RatingSummary; title: string }) {
  const { median, reviewCount, distribution } = rating

  return (
    <section id="rating" aria-labelledby="rating-heading" className={cn(panel, "scroll-mt-24")}>
      <h2 id="rating-heading" className="text-body-tight font-semibold text-ink">
        Verdix score
      </h2>

      {median === null ? (
        <div className="mt-4 flex flex-col gap-2">
          <p className="inline-flex items-center gap-2 text-heading-sm text-slate">
            <Star className="size-5" strokeWidth={1.5} aria-hidden="true" />
            Not rated yet
          </p>
          <p className="text-pretty text-meta text-slate">
            The score appears once members review {title}. It is the median of their scores out of 10.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-end justify-between gap-4">
            <ScoreNumeral score={median} tone="accent" size="md" />
            <p className="pb-1 text-meta tabular-nums text-slate">Median of {reviewsLabel(reviewCount)}</p>
          </div>
          <Distribution distribution={distribution} />
        </>
      )}
    </section>
  )
}

// Ten columns, one per score, scaled to the busiest score. No filled background track: an empty
// column is just its baseline. Screen readers get the same numbers as a list.
function Distribution({ distribution }: { distribution: number[] }) {
  const max = Math.max(1, ...distribution)
  return (
    <figure className="mt-5">
      <figcaption className="sr-only">How members scored it</figcaption>
      <ol className="grid h-20 grid-cols-10 items-end gap-1.5" aria-label="Reviews per score">
        {distribution.map((count, i) => (
          <li key={i} className="flex h-full flex-col justify-end">
            <span className="sr-only">
              {i + 1} out of 10: {reviewsLabel(count)}
            </span>
            <span
              aria-hidden="true"
              className={cn("block rounded-t-[3px]", count > 0 ? "bg-highlight" : "bg-hairline-soft")}
              style={{ height: count > 0 ? `${Math.max(8, (count / max) * 100)}%` : "2px" }}
            />
          </li>
        ))}
      </ol>
      <div aria-hidden="true" className="mt-1.5 grid grid-cols-10 gap-1.5 text-center text-micro-caps tabular-nums text-slate">
        {distribution.map((_, i) => (
          <span key={i}>{i + 1}</span>
        ))}
      </div>
    </figure>
  )
}

const groups: { key: "stream" | "free" | "rent" | "buy"; label: string }[] = [
  { key: "stream", label: "Stream" },
  { key: "free", label: "Free" },
  { key: "rent", label: "Rent" },
  { key: "buy", label: "Buy" },
]

// Where the film can be watched in the viewer's country. TMDB's API carries no links to each
// service, so the one link goes to TMDB's watch page, which has them. JustWatch supplies TMDB's
// data and asks for this credit wherever it is shown.
export function WatchPanel({ watch, region }: { watch: MovieDetail["watch"]; region: string }) {
  const country = regionName(watch?.region ?? region)
  return (
    <section aria-labelledby="watch-heading" className={panel}>
      <h2 id="watch-heading" className="text-body-tight font-semibold text-ink">
        Where to watch <span className="font-normal text-slate">in {country}</span>
      </h2>

      {watch ? (
        <>
          <div className="mt-4 flex flex-col gap-4">
            {groups.map(({ key, label }) =>
              watch[key].length > 0 ? (
                <div key={key} className="flex flex-col gap-2">
                  <h3 className="text-meta text-slate">{label}</h3>
                  <ProviderList providers={watch[key]} />
                </div>
              ) : null,
            )}
          </div>
          <a
            href={watch.link}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-1.5 rounded-inline text-link-sm text-highlight underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
          >
            Open Watch Options on TMDB
            <ExternalLink className="size-3.5" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </>
      ) : (
        <p className="mt-3 text-pretty text-meta text-slate">No streaming, rental or purchase options are listed in {country} right now.</p>
      )}
      <p className="mt-4 text-micro-caps text-slate">
        Availability by{" "}
        <a href="https://www.justwatch.com/" target="_blank" rel="noreferrer" translate="no" className="underline underline-offset-2 hover:text-ink">
          JustWatch
        </a>
      </p>
    </section>
  )
}

function ProviderList({ providers }: { providers: Provider[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {providers.map((p) => (
        <li key={p.id} title={p.name}>
          {p.logoPath ? (
            <img
              src={logoUrl(p.logoPath)}
              alt={p.name}
              width={44}
              height={44}
              loading="lazy"
              decoding="async"
              className="size-11 rounded-lg ring-1 ring-hairline-soft"
            />
          ) : (
            <span className="inline-flex h-11 items-center rounded-lg bg-surface-cool px-3 text-meta text-ink">{p.name}</span>
          )}
        </li>
      ))}
    </ul>
  )
}

// The reference facts, as a definition list. Rows with no data are left out rather than shown as "Unknown".
export function MovieFacts({ movie, region }: { movie: MovieDetail; region: string }) {
  const cert = movie.certification
  const rows: [string, string | null][] = [
    ["Release date", formatLongDate(movie.releaseDate)],
    ["Runtime", formatRuntime(movie.runtime)],
    ["Rated", cert ? (cert.region === region ? cert.rating : `${cert.rating} (${regionName(cert.region)})`) : null],
    ["Original language", movie.originalLanguage ? languageName(movie.originalLanguage) : null],
    ["Status", movie.status],
  ]
  const present = rows.filter((r): r is [string, string] => Boolean(r[1]))
  if (present.length === 0) return null

  return (
    <section aria-labelledby="facts-heading" className={panel}>
      <h2 id="facts-heading" className="text-body-tight font-semibold text-ink">
        Details
      </h2>
      <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3">
        {present.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-meta text-slate">{label}</dt>
            <dd className="break-words text-right text-meta text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

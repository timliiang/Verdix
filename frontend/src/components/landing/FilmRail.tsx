import { Link } from "react-router-dom"
import { motion } from "motion/react"
import { ArrowUpRight, Star } from "lucide-react"
import { films, trendingFilms } from "../../lib/landingData"

const countFormat = new Intl.NumberFormat("en-US")

export function FilmRail() {
  return (
    <section id="films" aria-labelledby="films-title" className="scroll-mt-16 bg-night-raised">
      <div className="mx-auto w-full max-w-[1280px] px-4 pt-20 sm:px-8 lg:px-12 lg:pt-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="films-title" className="text-balance text-[36px] leading-[1.05] tracking-[-0.03em] text-paper sm:text-[48px]">
            Ranked highest this week
          </h2>
          <Link
            to="/movies"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-paper underline-offset-4 hover:underline"
          >
            Browse All Films
            <ArrowUpRight
              className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>

      <ol
        className="no-scrollbar mx-auto flex w-full max-w-[1280px] snap-x snap-mandatory gap-5 overflow-x-auto xl:grid xl:grid-cols-6 xl:overflow-visible scroll-px-4 px-4 pb-20 pt-12 sm:scroll-px-8 sm:px-8 lg:scroll-px-12 lg:px-12 lg:pb-28"
        aria-label="Films ranked highest this week"
      >
        {trendingFilms.map((entry, i) => {
          const film = films[entry.id]
          return (
            <motion.li
              key={film.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="group flex w-[200px] shrink-0 snap-start flex-col gap-4 sm:w-[220px] xl:w-auto xl:min-w-0"
            >
              <div className="overflow-hidden rounded-[8px] bg-night">
                <img
                  src={film.posterUrl}
                  alt={`Poster for ${film.title}`}
                  width={1024}
                  height={1024}
                  loading="lazy"
                  className="aspect-[2/3] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline gap-3">
                  <span className="text-sm tabular-nums text-haze">{i + 1}</span>
                  <h3 className="min-w-0 truncate text-base text-paper">{film.title}</h3>
                </div>
                <p className="flex items-center gap-1.5 pl-[1.6rem] text-[13px] text-fog">
                  <Star className="size-3.5 fill-signal text-signal" strokeWidth={1.75} aria-hidden="true" />
                  <span className="tabular-nums text-paper">{entry.score.toFixed(1)}</span>
                  <span className="text-haze">from {countFormat.format(entry.rankings)} lists</span>
                </p>
              </div>
            </motion.li>
          )
        })}
      </ol>
    </section>
  )
}

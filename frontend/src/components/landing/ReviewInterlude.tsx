import { motion } from "motion/react"
import { featuredReview, films } from "../../lib/landingData"

export function ReviewInterlude() {
  const film = films[featuredReview.filmId]

  return (
    <section aria-label="A review from the community" className="mx-auto w-full max-w-[1280px] px-4 sm:px-8 lg:px-12">
      <motion.figure
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative isolate flex min-h-[560px] flex-col justify-end overflow-hidden rounded-[16px] bg-night-raised p-6 sm:p-12 lg:min-h-[640px]"
      >
        <img
          src="/movies/hero-backdrop.png"
          alt=""
          width={1024}
          height={1024}
          loading="lazy"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-night via-night/70 to-night/10" />

        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto] lg:gap-16">
          <blockquote className="max-w-[24ch] text-balance text-[28px] leading-[1.15] tracking-[-0.02em] text-paper sm:text-[40px]">
            &ldquo;{featuredReview.body}&rdquo;
          </blockquote>

          <figcaption className="flex items-center gap-4">
            <img
              src={film.posterUrl}
              alt=""
              width={64}
              height={96}
              loading="lazy"
              className="aspect-[2/3] w-16 rounded-[4px] object-cover ring-1 ring-paper/15"
            />
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-paper">{featuredReview.author}</span>
              <span className="text-fog">
                Ranked <span className="text-signal">#{featuredReview.rank}</span> in their list
              </span>
              <span className="text-fog">{film.title}</span>
            </div>
          </figcaption>
        </div>
      </motion.figure>
    </section>
  )
}

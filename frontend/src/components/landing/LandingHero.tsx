import { Link } from "react-router-dom"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"

const ease = [0.16, 1, 0.3, 1] as const

export function LandingHero() {
  return (
    <section aria-labelledby="hero-title" className="mx-auto w-full max-w-[1280px] px-4 pb-16 pt-8 sm:px-8 lg:px-12 lg:pt-12">
      <div className="grid items-center gap-10 lg:min-h-[calc(100dvh-8rem)] lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div className="flex flex-col gap-8">
          <motion.h1
            id="hero-title"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease }}
            className="text-balance text-[44px] leading-[1] tracking-[-0.035em] text-paper sm:text-[60px] lg:text-[76px]"
          >
            Rank every film you&rsquo;ve ever loved.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.12, ease }}
            className="max-w-[38ch] text-lg leading-[1.5] text-fog sm:text-xl"
          >
            Log what you watch. Verdix compares each new film against your history and builds a ranking that is
            yours.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.22, ease }}
            className="flex flex-wrap items-center gap-3"
          >
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
            <a
              href="#ranking"
              className="inline-flex h-12 items-center rounded-full border border-paper/25 px-6 text-sm font-semibold text-paper transition-colors duration-200 hover:border-paper/60"
            >
              Try the Ranking
            </a>
          </motion.div>
        </div>

        <motion.figure
          initial={{ scale: 1.04 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease }}
          className="relative overflow-hidden rounded-[16px] bg-night-raised"
        >
          <img
            src="/landing/night-street.jpg"
            alt="A rain-soaked city crossing at night, lit by green and white shop signs"
            width={800}
            height={1200}
            fetchPriority="high"
            className="aspect-[4/5] w-full object-cover sm:aspect-[3/4] lg:aspect-[2/3] lg:max-h-[calc(100dvh-10rem)]"
          />
        </motion.figure>
      </div>
    </section>
  )
}

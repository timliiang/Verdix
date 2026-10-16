import { motion } from "motion/react"

const steps = [
  {
    verb: "Log it.",
    body: "Search any film from the TMDB catalog and note the night you watched it.",
  },
  {
    verb: "Compare it.",
    body: "Answer a few quick this-or-that questions against films you have already ranked.",
  },
  {
    verb: "Share it.",
    body: "Your list lives on a public profile, so friends can see where you landed.",
  },
]

export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-16">
      <div className="mx-auto grid w-full max-w-[1280px] gap-12 px-4 py-20 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-12 lg:py-28">
        <div className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
          <p className="text-sm font-medium uppercase tracking-[0.06em] text-haze">How it works</p>
          <h2 id="how-title" className="text-balance text-[36px] leading-[1.05] tracking-[-0.03em] text-paper sm:text-[48px]">
            Three moves, every time you finish a film.
          </h2>
        </div>

        <ol className="flex flex-col">
          {steps.map((step, i) => (
            <motion.li
              key={step.verb}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-4 border-t border-rule py-10 first:border-t-0 first:pt-0 sm:flex-row sm:items-baseline sm:gap-10"
            >
              <h3 className="shrink-0 whitespace-nowrap text-[44px] leading-[1] tracking-[-0.035em] text-paper sm:w-[19rem] sm:text-[56px]">
                {step.verb}
              </h3>
              <p className="max-w-[36ch] text-lg leading-[1.5] text-fog">{step.body}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}

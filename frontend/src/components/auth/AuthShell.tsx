import "@fontsource-variable/geist"
import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import { HomeNav } from "../home/HomeChrome"
import { Reveal } from "../home/Reveal"
import { useTheme } from "../home/useTheme"

const ease = [0.16, 1, 0.3, 1] as const

interface AuthShellProps {
  title: string
  description: string
  children: ReactNode
  // The "New here? / Already a member?" line under the card.
  switchPrompt: ReactNode
  // The photographic panel beside the form from lg up.
  aside: ReactNode
}

// Shared frame for the signed-out screens. Same theme root, nav, tokens and ambient glow as the home
// page, so moving between them is seamless; the nav is in its minimal mode.
// Layout: < lg one column (the form card only, so it sits in the first viewport on phones);
// lg+ a 5/6 split with the photo stage on the right.
export function AuthShell({ title, description, children, switchPrompt, aside }: AuthShellProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div data-theme={theme} className="flex min-h-[100dvh] flex-col font-display text-ink antialiased">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-0 size-96 rounded-full bg-action/10 blur-[120px]" />
        <div className="absolute -right-40 top-1/2 size-96 rounded-full bg-action/5 blur-[140px]" />
      </div>

      <HomeNav theme={theme} onToggleTheme={toggleTheme} variant="minimal" />

      <main id="main" className="mx-auto grid w-full max-w-page flex-1 grid-cols-1 gap-6 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-10 lg:px-12 lg:py-8">
        <div className="flex justify-center sm:items-center lg:justify-start">
          <Reveal className="w-full max-w-md">
            <section aria-labelledby="auth-title" className="rounded-2xl border border-hairline-soft bg-hairline p-6 sm:p-10">
              <h1 id="auth-title" className="text-balance text-display-sm font-bold text-ink">
                {title}
              </h1>
              <p className="mt-3 text-body text-graphite">{description}</p>
              <div className="mt-8">{children}</div>
            </section>
            <p className="mt-6 text-center text-body text-graphite">{switchPrompt}</p>
          </Reveal>
        </div>

        <div className="hidden lg:block">{aside}</div>
      </main>
    </div>
  )
}

// A dark photographic stage, the same surface as the home hero: always the night palette, a still
// that settles in once on load, and a floor gradient so the copy reads.
export function AuthStage({ image, children }: { image: string; children: ReactNode }) {
  const reduce = useReducedMotion()

  return (
    <aside
      data-surface="stage"
      className="relative isolate flex h-full min-h-[560px] flex-col justify-end overflow-hidden rounded-2xl border border-hairline-soft bg-scrim p-10"
    >
      {/* lazy, not fetchpriority: the stage is display:none below lg, and lazy images that are not
          rendered are never fetched, so phones skip the download. At lg+ it is in the first viewport. */}
      <motion.img
        src={image}
        alt=""
        width={1024}
        height={1024}
        loading="lazy"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        initial={reduce ? false : { scale: 1.08, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease }}
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-canvas via-canvas/60 to-canvas/10" />
      {children}
    </aside>
  )
}

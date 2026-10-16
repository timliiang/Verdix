import { useReducer } from "react"
import { AnimatePresence, motion } from "motion/react"
import { RotateCcw } from "lucide-react"
import { cn } from "../../lib/utils"
import { demoQueue, demoStartingList, films, type LandingFilm } from "../../lib/landingData"

// Binary-insertion ranking: each pick halves the range the new film can land in.
interface RankState {
  ranked: string[]
  queueIndex: number
  lo: number
  hi: number
  placed: { id: string; position: number } | null
}

type RankAction = { type: "prefer"; newFilm: boolean } | { type: "reset" }

const initialState: RankState = {
  ranked: demoStartingList,
  queueIndex: 0,
  lo: 0,
  hi: demoStartingList.length,
  placed: null,
}

function reducer(state: RankState, action: RankAction): RankState {
  if (action.type === "reset") return initialState

  const mid = Math.floor((state.lo + state.hi) / 2)
  const lo = action.newFilm ? state.lo : mid + 1
  const hi = action.newFilm ? mid : state.hi
  if (lo < hi) return { ...state, lo, hi }

  const id = demoQueue[state.queueIndex]
  const ranked = [...state.ranked.slice(0, lo), id, ...state.ranked.slice(lo)]
  return { ranked, queueIndex: state.queueIndex + 1, lo: 0, hi: ranked.length, placed: { id, position: lo } }
}

// Scores are spread evenly from the top of the list to the bottom.
function scoreFor(index: number, total: number) {
  return (9.8 - (index * 3) / Math.max(total - 1, 1)).toFixed(1)
}

function PosterChoice({ film, onPick }: { film: LandingFilm; onPick: () => void }) {
  return (
    <motion.button
      key={film.id}
      type="button"
      onClick={onPick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      aria-label={`I liked ${film.title} more`}
      className="group flex flex-col gap-3 rounded-[8px] text-left outline-offset-4 focus-visible:outline-2 focus-visible:outline-signal"
    >
      <span className="block overflow-hidden rounded-[8px] bg-night-raised ring-1 ring-rule transition-shadow duration-200 group-hover:ring-paper/40">
        <img
          src={film.posterUrl}
          alt=""
          width={1024}
          height={1024}
          loading="lazy"
          className="aspect-[2/3] w-full object-cover"
        />
      </span>
      <span className="flex flex-col gap-1">
        <span className="text-base leading-[1.3] text-paper">{film.title}</span>
        <span className="text-[13px] text-haze">
          {film.genre}, {film.year}
        </span>
      </span>
    </motion.button>
  )
}

export function RankDemo() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const currentId = demoQueue[state.queueIndex]
  const done = currentId === undefined
  const challenger = done ? null : films[currentId]
  const opponent = done ? null : films[state.ranked[Math.floor((state.lo + state.hi) / 2)]]

  return (
    <section id="ranking" aria-labelledby="ranking-title" className="scroll-mt-16 border-t border-rule">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-20 sm:px-8 lg:px-12 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex max-w-[52rem] flex-col gap-5"
        >
          <h2 id="ranking-title" className="text-balance text-[36px] leading-[1.05] tracking-[-0.03em] text-paper sm:text-[48px]">
            No stars to agonize over. Just this or that.
          </h2>
          <p className="max-w-[60ch] text-lg leading-[1.5] text-fog">
            Pick the film you liked more. A few comparisons are enough for Verdix to find its exact place in your list.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          {/* Comparison */}
          <div className="flex flex-col gap-6">
            <p className="text-xl leading-[1.3] text-paper" aria-live="polite">
              {done
                ? "Both films are placed. That's your ranking."
                : "Which did you like more?"}
            </p>

            {done ? (
              <div className="flex flex-col items-start gap-6 rounded-[16px] border border-rule p-8">
                <p className="max-w-[44ch] text-base leading-[1.5] text-fog">
                  Every film you log gets placed the same way: a few quick comparisons against what you have already ranked.
                </p>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "reset" })}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-paper/25 px-5 text-sm font-semibold text-paper transition-colors duration-200 hover:border-paper/60 active:scale-[0.98]"
                >
                  <RotateCcw className="size-4" strokeWidth={1.75} aria-hidden="true" />
                  Start Over
                </button>
              </div>
            ) : (
              <div className="grid max-w-[34rem] grid-cols-[1fr_auto_1fr] items-start gap-4 sm:gap-6">
                <AnimatePresence mode="wait" initial={false}>
                  <PosterChoice
                    key={challenger!.id}
                    film={challenger!}
                    onPick={() => dispatch({ type: "prefer", newFilm: true })}
                  />
                </AnimatePresence>
                <span className="self-center pb-12 text-sm text-haze" aria-hidden="true">
                  or
                </span>
                <AnimatePresence mode="wait" initial={false}>
                  <PosterChoice
                    key={opponent!.id}
                    film={opponent!}
                    onPick={() => dispatch({ type: "prefer", newFilm: false })}
                  />
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Live list */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm text-haze">Your list</h3>
            <ol className="flex flex-col">
              {state.ranked.map((id, i) => {
                const film = films[id]
                const fresh = state.placed?.id === id
                return (
                  <motion.li
                    key={id}
                    layout="position"
                    transition={{ type: "spring", stiffness: 260, damping: 30 }}
                    className="grid grid-cols-[2rem_3rem_1fr_auto] items-center gap-4 border-b border-rule py-3 last:border-b-0"
                  >
                    <span className={cn("text-lg tabular-nums", fresh ? "text-signal" : "text-haze")}>{i + 1}</span>
                    <img
                      src={film.posterUrl}
                      alt=""
                      width={48}
                      height={72}
                      loading="lazy"
                      className="aspect-[2/3] w-12 rounded-[4px] object-cover"
                    />
                    <span className="min-w-0 truncate text-base text-paper">{film.title}</span>
                    <span className={cn("text-base tabular-nums", fresh ? "text-signal" : "text-fog")}>
                      {scoreFor(i, state.ranked.length)}
                    </span>
                  </motion.li>
                )
              })}
            </ol>
            <p className="sr-only" aria-live="polite">
              {state.placed ? `${films[state.placed.id].title} placed at number ${state.placed.position + 1}.` : ""}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

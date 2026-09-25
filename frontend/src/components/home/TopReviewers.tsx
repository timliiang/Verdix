import { Trophy, UserPlus } from "lucide-react"
import type { Reviewer } from "../../lib/homeTypes"
import { formatCount, initials } from "../../lib/format"

export function TopReviewers({ reviewers }: { reviewers: Reviewer[] }) {
  return (
    <section
      aria-labelledby="reviewers-title"
      className="rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex items-center gap-2">
        <Trophy className="size-5 text-primary drop-shadow-[0_0_8px_var(--primary)]" aria-hidden="true" />
        <h2 id="reviewers-title" className="text-lg font-bold tracking-tight">
          Top Reviewers
        </h2>
      </div>

      <ul className="mt-4 flex flex-col gap-1">
        {reviewers.map((r, i) => (
          <li key={r.id}>
            <div className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-secondary/60">
              <span
                className="w-4 shrink-0 text-center text-sm font-bold text-muted-foreground group-hover:text-primary"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <span
                className={`grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${r.avatarColor} text-xs font-bold text-black ring-2 ring-background`}
                aria-hidden="true"
              >
                {initials(r.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{r.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatCount(r.followers)} followers
                </p>
              </div>
              <button
                className="grid size-8 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                aria-label={`Follow ${r.name}`}
              >
                <UserPlus className="size-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button className="mt-3 w-full rounded-lg border border-border py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
        View leaderboard
      </button>
    </section>
  )
}

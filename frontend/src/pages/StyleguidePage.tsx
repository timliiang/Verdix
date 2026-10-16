import "@fontsource-variable/geist"
import type { ReactNode } from "react"
import { Button } from "../components/ui/Button"
import { TextField } from "../components/ui/TextField"
import { ScoreNumeral } from "../components/ui/ScoreNumeral"
import { FilmCard, type FilmCardData } from "../components/ui/FilmCard"
import { films as catalogue } from "../lib/landingData"

const colorGroups: { title: string; swatches: { token: string; hex: string; bg: string; note: string }[] }[] = [
  {
    title: "Action",
    swatches: [
      { token: "action", hex: "#000000", bg: "bg-action", note: "Every primary pill. DESIGN.md primary" },
      { token: "on-action", hex: "#ffffff", bg: "bg-on-action", note: "Type on action surfaces" },
    ],
  },
  {
    title: "Surface",
    swatches: [
      { token: "canvas", hex: "#ffffff", bg: "bg-canvas", note: "Reading background" },
      { token: "canvas-warm", hex: "#fefefe", bg: "bg-canvas-warm", note: "Poster tile lift" },
      { token: "hairline", hex: "#e7eaf0", bg: "bg-hairline", note: "Dividers, featured infill" },
      { token: "hairline-soft", hex: "#c9ccd1", bg: "bg-hairline-soft", note: "Field rules, column rules" },
      { token: "surface-cool", hex: "#d0d4d4", bg: "bg-surface-cool", note: "Media placeholder" },
      { token: "scrim", hex: "#1a1a1a", bg: "bg-scrim", note: "Photographic stage" },
      { token: "footer", hex: "#030303", bg: "bg-footer", note: "Terminal surface" },
    ],
  },
  {
    title: "Text",
    swatches: [
      { token: "ink", hex: "#030303", bg: "bg-ink", note: "Headings, emphasis" },
      { token: "ink-soft", hex: "#1a1a1a", bg: "bg-ink-soft", note: "Nav, secondary heads" },
      { token: "graphite", hex: "#404040", bg: "bg-graphite", note: "Body copy" },
      { token: "slate", hex: "#676f7b", bg: "bg-slate", note: "Tertiary metadata" },
      { token: "slate-soft", hex: "#727a85", bg: "bg-slate-soft", note: "Labels on dark" },
      { token: "mute", hex: "#6b7280", bg: "bg-mute", note: "Disabled, fine print" },
      { token: "stone", hex: "#939393", bg: "bg-stone", note: "Placeholders, eyebrows on dark" },
      { token: "ash", hex: "#999999", bg: "bg-ash", note: "Captions" },
    ],
  },
]

const typeScale = [
  { token: "display", spec: "48 / 1.0 / 400 / -0.025em", cls: "text-display", sample: "Rank every film you've loved" },
  { token: "display-sm", spec: "40 / 1.0 / 400 / -0.025em", cls: "text-display-sm", sample: "Ranked highest this week" },
  { token: "heading-md", spec: "36 / 1.0 / 400 / -0.025em", cls: "text-heading-md", sample: "Your top films of 2026" },
  { token: "heading-sm", spec: "24 / 1.0 / 400", cls: "text-heading-sm", sample: "Midnight Signal" },
  { token: "subtitle", spec: "20 / 1.0 / 400", cls: "text-subtitle", sample: "Log what you watch. Verdix builds the ranking." },
  { token: "body", spec: "16 / 1.5 / 400", cls: "text-body text-graphite", sample: "Answer a few this-or-that questions against films you have already ranked." },
  { token: "body-strong", spec: "16 / 1.5 / 600", cls: "text-body font-semibold", sample: "Placed 4th of 212 films" },
  { token: "body-tight", spec: "16 / 1.3 / 400 / -0.01em", cls: "text-body-tight", sample: "Neon Requiem, a rain-drenched noir" },
  { token: "link-sm", spec: "14 / 1.43 / 600", cls: "text-link-sm underline underline-offset-4", sample: "Browse all films" },
  { token: "eyebrow", spec: "14 / 1.43 / 500 / +0.025em, uppercase", cls: "text-eyebrow uppercase text-slate", sample: "This week" },
  { token: "meta", spec: "13 / 1.3 / 400 / -0.02em", cls: "text-meta text-stone", sample: "2025 · Drama · 1h 52m" },
  { token: "micro-caps", spec: "11 / 1.3 / 450 / +0.018em, uppercase", cls: "text-micro-caps uppercase text-slate", sample: "Sci-Fi" },
  { token: "button", spec: "14 / 1.43 / 600", cls: "text-button", sample: "Start ranking" },
]

// Real catalogue entries so the titles printed on the poster art match the captions.
const sample: [keyof typeof catalogue, number][] = [
  ["neon-drifter", 9.4],
  ["distance", 8.9],
  ["golden-dusk", 8.1],
  ["last-light", 7.6],
]
const films: FilmCardData[] = sample.map(([id, score], i) => ({ ...catalogue[id], score, rank: i + 1 }))

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-hairline py-section">
      <p className="text-eyebrow uppercase text-slate">{eyebrow}</p>
      <h2 id={`${id}-title`} className="mt-3 text-heading-md text-ink">
        {title}
      </h2>
      <div className="mt-12">{children}</div>
    </section>
  )
}

function Swatch({ token, hex, bg, note }: { token: string; hex: string; bg: string; note: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className={`${bg} aspect-[4/3] rounded-media ring-1 ring-hairline ring-inset`} />
      <div className="flex flex-col gap-0.5">
        <p className="text-link-sm text-ink">{token}</p>
        <p className="text-meta tabular-nums text-slate">{hex}</p>
        <p className="text-meta text-stone">{note}</p>
      </div>
    </div>
  )
}

function Specimen({ label, children, dark = false }: { label: string; children: ReactNode; dark?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <div className={`flex min-h-28 items-center justify-center rounded-media px-6 ${dark ? "bg-scrim" : "bg-canvas ring-1 ring-hairline ring-inset"}`}>
        {children}
      </div>
      <p className="text-meta text-slate">{label}</p>
    </div>
  )
}

export default function StyleguidePage() {
  return (
    <div className="min-h-[100dvh] bg-canvas font-display text-ink antialiased">
      <header className="mx-auto flex h-16 max-w-page items-center justify-between px-6 lg:px-12">
        <span className="text-heading-sm lowercase">verdix</span>
        <span className="text-meta text-stone">Styleguide · source: DESIGN.md</span>
      </header>

      <main className="mx-auto max-w-page px-6 lg:px-12">
        <div className="pb-section pt-section-lg">
          <p className="text-eyebrow uppercase text-slate">Design system</p>
          <h1 className="mt-3 max-w-3xl text-display text-ink">Black ink on paper, and one number that matters.</h1>
          <p className="mt-6 max-w-2xl text-body text-graphite">
            Every token on this page comes from <code className="text-body-strong text-ink">src/index.css</code>. One sans
            carries every level, the neutral ladder does the work colour would, and the only primary action is a black
            pill.
          </p>
        </div>

        <Section id="colors" eyebrow="01 · Colour" title="A monochrome ladder">
          <div className="flex flex-col gap-12">
            {colorGroups.map((group) => (
              <div key={group.title}>
                <h3 className="text-micro-caps uppercase text-slate">{group.title}</h3>
                <div className="mt-4 grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-8">
                  {group.swatches.map((s) => (
                    <Swatch key={s.token} {...s} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section id="type" eyebrow="02 · Typography" title="One face, every level">
          <dl className="divide-y divide-hairline border-y border-hairline">
            {typeScale.map((t) => (
              <div key={t.token} className="grid grid-cols-1 gap-2 py-5 md:grid-cols-[180px_220px_1fr] md:items-baseline md:gap-8">
                <dt className="text-link-sm text-ink">{t.token}</dt>
                <dd className="text-meta tabular-nums text-stone">{t.spec}</dd>
                <dd className={`${t.cls} min-w-0 truncate`}>{t.sample}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="buttons" eyebrow="03 · Actions" title="Buttons">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            <Specimen label="primary: one per viewport">
              <Button>Start ranking</Button>
            </Specimen>
            <Specimen label="ghost: the secondary action">
              <Button variant="ghost">Browse films</Button>
            </Specimen>
            <Specimen label="text-link: inline actions">
              <Button variant="text-link">View all 212</Button>
            </Specimen>
            <Specimen label="primary-on-dark: on scrim" dark>
              <Button variant="primary-on-dark">Start ranking</Button>
            </Specimen>
            <Specimen label="disabled: 40% opacity">
              <Button disabled>Start ranking</Button>
            </Specimen>
          </div>
        </Section>

        <Section id="inputs" eyebrow="04 · Forms" title="Inputs">
          <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            <TextField label="Username" placeholder="Type your username" helper="Shown on your public lists" />
            <TextField label="Email" type="email" defaultValue="mara@verdix.app" helper="Focused: the rule deepens to ink" autoFocus />
            <TextField label="Password" type="password" defaultValue="short" required error="Use at least 8 characters" />
            <TextField label="Invite code" placeholder="Not needed right now" disabled />
          </div>
        </Section>

        <Section id="film-card" eyebrow="05 · Content" title="Film card">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {films.map((film) => (
              <FilmCard key={film.title} film={film} />
            ))}
          </div>
        </Section>

        <Section id="score" eyebrow="06 · Signature" title="The score numeral">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1fr]">
            <div className="flex items-end gap-12 border-b border-hairline pb-8">
              <ScoreNumeral score={9.4} size="lg" />
              <ScoreNumeral score={8.9} size="md" />
              <ScoreNumeral score={7.6} size="sm" />
            </div>
            <div className="flex flex-col gap-4 text-body text-graphite">
              <p>
                <span className="text-body-strong text-ink">score</span> · 72 / 0.9 / 400 / -0.04em. It sits one step past
                display: the same regular weight, tracked tighter because the numerals are the hero.
              </p>
              <p>
                Always one decimal, always tabular figures so a column of scores aligns. The /10 scale stays in stone so it
                never competes with the number.
              </p>
            </div>
          </div>
          <div className="mt-12 overflow-hidden rounded-panel bg-scrim p-12 text-on-action">
            <p className="text-eyebrow uppercase text-on-action/70">Your #1 this year</p>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-8">
              <h3 className="text-display">Neon Drifter</h3>
              <ScoreNumeral score={9.4} className="text-on-action [&>span:last-child]:text-ash" />
            </div>
          </div>
        </Section>
      </main>

      <footer className="mt-section bg-footer px-6 py-section text-on-action lg:px-12">
        <div className="mx-auto flex max-w-page items-end justify-between">
          <span className="text-heading-sm lowercase">verdix</span>
          <span className="text-eyebrow uppercase text-stone">Tokens · v1</span>
        </div>
      </footer>
    </div>
  )
}

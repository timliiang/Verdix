import { useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "../../lib/utils"
import { artworkUrl, backdropUrl, posterUrl } from "../../lib/tmdbImage"
import type { ArtworkImage } from "../../lib/movieTypes"

type Kind = "poster" | "backdrop"

const PREVIEW = { poster: 10, backdrop: 6 } as const

interface ArtworkGalleryProps {
  title: string
  posters: ArtworkImage[]
  backdrops: ArtworkImage[]
}

// Official posters and backdrops from TMDB. A segmented toggle picks the set; a short preview
// grid expands to the full set; any image opens in the lightbox.
export function ArtworkGallery({ title, posters, backdrops }: ArtworkGalleryProps) {
  const [kind, setKind] = useState<Kind>(posters.length > 0 ? "poster" : "backdrop")
  const [expanded, setExpanded] = useState(false)
  const [open, setOpen] = useState<number | null>(null)

  const images = kind === "poster" ? posters : backdrops
  const shown = expanded ? images : images.slice(0, PREVIEW[kind])
  const sets: { kind: Kind; label: string; count: number }[] = [
    { kind: "poster", label: "Posters", count: posters.length },
    { kind: "backdrop", label: "Backdrops", count: backdrops.length },
  ]

  return (
    <div className="flex flex-col gap-5">
      {posters.length > 0 && backdrops.length > 0 && (
        <div role="group" aria-label="Artwork type" className="inline-flex w-fit gap-1 rounded-xl border border-hairline-soft bg-hairline p-1">
          {sets.map((s) => (
            <button
              key={s.kind}
              type="button"
              aria-pressed={kind === s.kind}
              onClick={() => {
                setKind(s.kind)
                setExpanded(false)
              }}
              className={cn(
                "cursor-pointer rounded-lg px-3.5 py-1.5 text-link-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
                kind === s.kind ? "bg-canvas text-ink shadow-sm" : "text-slate hover:text-ink",
              )}
            >
              {s.label} <span className="tabular-nums text-slate">{s.count}</span>
            </button>
          ))}
        </div>
      )}

      <ul
        className={cn(
          "grid gap-3",
          kind === "poster" ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
        )}
      >
        {shown.map((img, i) => (
          <li key={img.path}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className={cn(
                "group block w-full cursor-pointer overflow-hidden rounded-media bg-surface-cool ring-1 ring-hairline-soft transition-[box-shadow] hover:ring-highlight/60",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
                kind === "poster" ? "aspect-[2/3]" : "aspect-video",
              )}
            >
              <span className="sr-only">
                Open {kind} {i + 1} of {images.length}
              </span>
              <img
                src={kind === "poster" ? posterUrl(img.path, 185) : backdropUrl(img.path, 300)}
                srcSet={
                  kind === "poster"
                    ? `${posterUrl(img.path, 185)} 185w, ${posterUrl(img.path, 342)} 342w`
                    : `${backdropUrl(img.path, 300)} 300w, ${backdropUrl(img.path, 780)} 780w`
                }
                sizes={kind === "poster" ? "(min-width: 768px) 160px, 33vw" : "(min-width: 768px) 260px, (min-width: 640px) 50vw, 100vw"}
                alt=""
                width={kind === "poster" ? 185 : 300}
                height={kind === "poster" ? 278 : 169}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </button>
          </li>
        ))}
      </ul>

      {images.length > PREVIEW[kind] && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="w-fit cursor-pointer rounded-inline text-link-sm text-highlight underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
        >
          {expanded ? "Show Fewer" : `Show All ${images.length} ${kind === "poster" ? "Posters" : "Backdrops"}`}
        </button>
      )}

      <Lightbox title={title} kind={kind} images={images} index={open} onIndex={setOpen} />
    </div>
  )
}

interface LightboxProps {
  title: string
  kind: Kind
  images: ArtworkImage[]
  index: number | null
  onIndex: (i: number | null) => void
}

// Native <dialog> opened with showModal(): the page behind becomes inert (focus is trapped for
// free), Esc closes it, and the browser returns focus to the thumbnail that opened it.
function Lightbox({ title, kind, images, index, onIndex }: LightboxProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const open = index !== null

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  const step = (delta: number) => {
    if (index === null) return
    onIndex((index + delta + images.length) % images.length)
  }

  const image = index !== null ? images[index] : null
  const label = image ? `${title}, ${kind} ${index! + 1} of ${images.length}` : title

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={() => onIndex(null)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1)
        if (e.key === "ArrowLeft") step(-1)
      }}
      // A click on the backdrop (the dialog element itself, outside the figure) closes it.
      onClick={(e) => e.target === e.currentTarget && onIndex(null)}
      data-surface="stage"
      className="m-auto max-h-none max-w-none overscroll-contain bg-transparent p-0 text-ink backdrop:bg-scrim/90 backdrop:backdrop-blur-sm"
    >
      {image && (
        <div className="flex h-[100dvh] w-screen items-center justify-center gap-2 p-4 sm:gap-4 sm:p-8" onClick={(e) => e.target === e.currentTarget && onIndex(null)}>
          {images.length > 1 && <NavButton label="Previous image" onClick={() => step(-1)} icon={<ChevronLeft className="size-5" aria-hidden="true" />} />}
          <img
            key={image.path}
            src={artworkUrl(image.path, kind)}
            alt={`${title} ${kind}`}
            width={image.width}
            height={image.height}
            className={cn(
              "max-h-full min-w-0 rounded-media object-contain shadow-2xl",
              kind === "poster" ? "max-w-[min(100%,34rem)]" : "max-w-[min(100%,72rem)]",
            )}
          />
          {images.length > 1 && <NavButton label="Next image" onClick={() => step(1)} icon={<ChevronRight className="size-5" aria-hidden="true" />} />}
          <button
            type="button"
            onClick={() => onIndex(null)}
            aria-label="Close"
            className="absolute right-4 top-4 grid size-11 cursor-pointer place-items-center rounded-full bg-canvas/70 text-ink ring-1 ring-ink/15 backdrop-blur transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </dialog>
  )
}

function NavButton({ label, onClick, icon }: { label: string; onClick: () => void; icon: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-canvas/70 text-ink ring-1 ring-ink/15 backdrop-blur transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"
    >
      {icon}
    </button>
  )
}

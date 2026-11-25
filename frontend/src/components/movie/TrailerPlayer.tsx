import { useState } from "react"
import { Play } from "lucide-react"
import { cn } from "../../lib/utils"
import { youtubeEmbed, youtubeThumbnail } from "../../lib/tmdbImage"
import type { Video } from "../../lib/movieTypes"

interface TrailerPlayerProps {
  title: string
  videos: Video[]
  // Set by the hero's Play Trailer button; the player starts the lead video when it flips on.
  playing: boolean
  onPlay: () => void
}

// A facade: the thumbnail and a real <button> until the viewer asks for the video, then the
// YouTube iframe (privacy-enhanced host, autoplay since the click was the intent to watch). An
// embed loads ~1 MB of script and sets cookies, so mounting it up front would slow every visit.
export function TrailerPlayer({ title, videos, playing, onPlay }: TrailerPlayerProps) {
  const [index, setIndex] = useState(0)
  const video = videos[index] ?? videos[0]
  if (!video) return null

  return (
    <div className="flex flex-col gap-3">
      <div data-surface="stage" className="relative aspect-video overflow-hidden rounded-2xl border border-hairline-soft bg-scrim">
        {playing ? (
          <iframe
            key={video.key}
            src={youtubeEmbed(video.key)}
            title={`${video.name}, ${title}`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={onPlay}
            className="group absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-highlight"
          >
            <span className="sr-only">
              Play {video.name} for {title}
            </span>
            <img
              src={youtubeThumbnail(video.key)}
              alt=""
              width={480}
              height={360}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover opacity-80 transition-[opacity,scale] duration-500 ease-out group-hover:scale-[1.02] group-hover:opacity-100 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-scrim/80 via-transparent to-transparent" />
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-action text-on-action shadow-lg transition-transform duration-200 group-hover:scale-110 group-active:scale-95 motion-reduce:group-hover:scale-100 sm:size-20"
            >
              <Play className="size-7 translate-x-0.5 fill-current sm:size-8" />
            </span>
            <span aria-hidden="true" className="absolute bottom-4 left-4 right-4 truncate text-left text-body-tight font-semibold text-ink">
              {video.name}
            </span>
          </button>
        )}
      </div>

      {videos.length > 1 && (
        <div role="group" aria-label="Choose a video" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
          {videos.map((v, i) => (
            <button
              key={v.key}
              type="button"
              aria-pressed={i === index}
              onClick={() => {
                setIndex(i)
                onPlay()
              }}
              className={cn(
                "max-w-[16rem] shrink-0 cursor-pointer truncate rounded-full border px-3.5 py-1.5 text-meta transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
                i === index
                  ? "border-highlight/60 bg-highlight/10 text-ink"
                  : "border-hairline-soft bg-hairline text-slate hover:border-highlight/40 hover:text-ink",
              )}
            >
              {v.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

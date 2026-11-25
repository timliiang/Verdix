// The film page's shape while it loads: hero card, then the two columns. Same frame and spacing as
// the real page, so nothing jumps when it arrives.
const block = "rounded-2xl bg-hairline animate-pulse motion-reduce:animate-none"

export function MovieSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="relative overflow-hidden rounded-2xl border border-hairline-soft bg-hairline">
        <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-end gap-5 px-5 pb-6 pt-28 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-8 sm:px-8 sm:pb-8 sm:pt-40 lg:grid-cols-[13rem_minmax(0,1fr)] lg:px-10 lg:pb-10 lg:pt-48">
          <div className="aspect-[2/3] animate-pulse rounded-media bg-surface-cool motion-reduce:animate-none" />
          <div className="flex flex-col gap-4">
            <div className="h-10 w-3/4 rounded-lg bg-surface-cool sm:h-12" />
            <div className="flex gap-2">
              <div className="h-7 w-14 rounded-full bg-surface-cool" />
              <div className="h-7 w-12 rounded-full bg-surface-cool" />
              <div className="h-7 w-20 rounded-full bg-surface-cool" />
            </div>
            <div className="hidden h-4 w-1/2 rounded bg-surface-cool sm:block" />
          </div>
        </div>
      </div>
      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-4">
          <div className="h-6 w-32 rounded bg-hairline" />
          <div className="h-4 w-full rounded bg-hairline" />
          <div className="h-4 w-11/12 rounded bg-hairline" />
          <div className="h-4 w-2/3 rounded bg-hairline" />
          <div className={`${block} mt-8 aspect-video`} />
        </div>
        <div className="flex flex-col gap-6">
          <div className={`${block} h-44`} />
          <div className={`${block} h-56`} />
        </div>
      </div>
    </div>
  )
}

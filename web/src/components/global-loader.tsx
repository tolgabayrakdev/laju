import { useIsFetching, useIsMutating } from '@tanstack/react-query'

export default function GlobalLoader() {
  const fetching = useIsFetching()
  const mutating = useIsMutating()
  const isActive = fetching + mutating > 0

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${
        isActive ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-foreground animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

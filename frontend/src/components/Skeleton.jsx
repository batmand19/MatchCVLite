export default function Skeleton({ visible }) {
  if (!visible) return null

  return (
    <div className="animate-pulse space-y-5">
      <div className="flex justify-center py-6">
        <div className="w-[60px] h-[60px] rounded-full bg-[var(--border)]" />
      </div>
      <div className="h-20 rounded-xl bg-[var(--border)]/60" />
      <div className="h-20 rounded-xl bg-[var(--border)]/60" />
      <div className="h-20 rounded-xl bg-[var(--border)]/60" />
      <div className="space-y-2">
        <div className="h-4 rounded bg-[var(--border)]/60" />
        <div className="h-4 rounded bg-[var(--border)]/60" />
        <div className="h-4 rounded bg-[var(--border)]/60" />
        <div className="h-4 rounded bg-[var(--border)]/60" />
      </div>
    </div>
  )
}

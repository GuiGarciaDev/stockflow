export function FullPageLoader({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="glass-card rounded-[2rem] p-6">
          <div className="h-2 w-24 bg-white/[0.06] rounded-full animate-pulse" />
          <div className="mt-4 text-sm text-neutral-400">{label}</div>
        </div>
      </div>
    </div>
  )
}

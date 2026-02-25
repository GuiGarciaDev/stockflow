export function FullPageLoader({ label }: { label: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="rounded-xl bg-white border border-slate-200 p-6">
          <div className="h-2 w-24 bg-slate-200 rounded animate-pulse" />
          <div className="mt-4 text-sm text-slate-600">{label}</div>
        </div>
      </div>
    </div>
  )
}

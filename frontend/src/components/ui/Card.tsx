export function Card({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-5">
      {title ? (
        <div className="mb-4 text-base font-semibold">{title}</div>
      ) : null}
      {children}
    </div>
  )
}

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export function Input({ label, error, className = "", id, ...props }: Props) {
  const inputId = id ?? props.name ?? label
  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-slate-700"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-400 disabled:bg-slate-100 ${className}`}
        {...props}
      />
      {error ? <div className="mt-1 text-xs text-red-600">{error}</div> : null}
    </div>
  )
}

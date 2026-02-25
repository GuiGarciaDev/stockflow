import { forwardRef } from "react"

type Variant = "primary" | "secondary" | "danger"

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className = "", variant = "primary", disabled, ...props },
  ref,
) {
  const base =
    "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
  const styles: Record<Variant, string> = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    secondary:
      "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
    danger: "bg-red-600 text-white hover:bg-red-500",
  }
  return (
    <button
      ref={ref}
      className={`${base} ${styles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    />
  )
})

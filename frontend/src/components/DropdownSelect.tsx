import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Icon } from "@iconify/react"

export type DropdownOption = {
  value: string
  label: string
  disabled?: boolean
}

type Props = {
  value: string
  onChange: (nextValue: string) => void
  options: DropdownOption[]
  placeholder?: string
  disabled?: boolean
  buttonClassName?: string
  menuClassName?: string
}

export function DropdownSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled,
  buttonClassName,
  menuClassName,
}: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const selectedLabel = useMemo(() => {
    if (!value) return ""
    return options.find((o) => o.value === value)?.label ?? ""
  }, [options, value])

  useEffect(() => {
    if (!open) return

    function onPointerDown(e: PointerEvent) {
      const root = rootRef.current
      if (!root) return
      if (root.contains(e.target as Node)) return
      setOpen(false)
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }

    window.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  const interactive = !disabled

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className={[
          "w-full px-4 py-3 rounded-xl input-field text-sm flex items-center justify-between gap-3",
          "transition-colors",
          open ? "border-emerald-500/40" : "",
          interactive
            ? "cursor-pointer hover:border-emerald-500/20"
            : "opacity-60 cursor-not-allowed",
          buttonClassName ?? "",
        ].join(" ")}
        onClick={() => {
          if (!interactive) return
          setOpen((v) => !v)
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span className={value ? "text-white" : "text-neutral-500"}>
          {value ? selectedLabel : placeholder}
        </span>
        <Icon icon="lucide:chevron-down" className="text-neutral-500" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            className={[
              "absolute left-0 right-0 mt-2 z-50",
              "rounded-xl border border-white/10 overflow-hidden bg-neutral-900 shadow-2xl",
              menuClassName ?? "",
            ].join(" ")}
            role="listbox"
          >
            <div className="max-h-64 overflow-auto py-1">
              {options.map((opt) => {
                const active = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={[
                      "w-full text-left px-4 py-2 text-sm flex items-center justify-between gap-3",
                      opt.disabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-emerald-500/10",
                      active ? "bg-emerald-500/10" : "",
                    ].join(" ")}
                    onClick={() => {
                      if (opt.disabled) return
                      onChange(opt.value)
                      setOpen(false)
                    }}
                    disabled={opt.disabled}
                    role="option"
                    aria-selected={active}
                  >
                    <span className="text-neutral-100">{opt.label}</span>
                    {active ? (
                      <Icon
                        icon="lucide:check"
                        className="text-emerald-500 shrink-0"
                      />
                    ) : null}
                  </button>
                )
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

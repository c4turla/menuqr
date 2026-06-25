"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type SelectContextType = {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
  getLabel: (value: string) => string
}

const SelectContext = React.createContext<SelectContextType | null>(null)

function useSelectContext() {
  const ctx = React.useContext(SelectContext)
  if (!ctx) throw new Error("Select components must be used within Select")
  return ctx
}

function Select({
  value,
  onValueChange,
  children,
}: {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)

  const labelMap = React.useMemo(() => {
    const map = new Map<string, string>()
    React.Children.forEach(children, (child) => {
      if (
        React.isValidElement(child) &&
        (child.type as React.ComponentType & { displayName?: string })?.displayName === "SelectContent"
      ) {
        const contentChildren = (
          child.props as { children?: React.ReactNode }
        ).children
        React.Children.forEach(contentChildren, (item) => {
          if (React.isValidElement(item)) {
            const itemProps = item.props as { value?: string; children?: React.ReactNode }
            if (itemProps.value && typeof itemProps.children === "string") {
              map.set(itemProps.value, itemProps.children)
            }
          }
        })
      }
    })
    return map
  }, [children])

  const getLabel = React.useCallback(
    (v: string) => labelMap.get(v) ?? "",
    [labelMap]
  )

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, getLabel }}>
      <div data-slot="select" className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { open, setOpen } = useSelectContext()

  return (
    <button
      type="button"
      data-slot="select-trigger"
      data-state={open ? "open" : "closed"}
      className={cn(
        "flex h-8 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
        className
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      <span className="line-clamp-1">{children}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0 opacity-50"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value, getLabel } = useSelectContext()
  const label = getLabel(value)

  return (
    <span className={!value ? "text-muted-foreground" : ""}>
      {label || placeholder}
    </span>
  )
}

function SelectContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  const { open, setOpen } = useSelectContext()

  if (!open) return null

  return (
    <>
      <div
        data-slot="select-overlay"
        className="fixed inset-0 z-40"
        onClick={() => setOpen(false)}
      />
      <div
        data-slot="select-content"
        className={cn(
          "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-md",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  )
}
SelectContent.displayName = "SelectContent"

function SelectItem({
  className,
  value: itemValue,
  children,
  ...props
}: React.ComponentProps<"div"> & { value: string }) {
  const { value, onValueChange, setOpen } = useSelectContext()

  return (
    <div
      data-slot="select-item"
      data-state={value === itemValue ? "checked" : "unchecked"}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground",
        className
      )}
      onClick={() => {
        onValueChange(itemValue)
        setOpen(false)
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }

'use client'

import { cn } from '@/lib/utils'

interface AssetTypeBubbleProps {
  label: string
  icon: React.ReactNode
  isSelected: boolean
  onClick: () => void
}

export function AssetTypeBubble({ label, icon, isSelected, onClick }: AssetTypeBubbleProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-row items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-md transition-all",
        "touch-manipulation active:scale-95 hover:scale-102",
        "min-w-[70px] md:min-w-fit h-10 md:h-auto",
        isSelected
          ? "bg-primary text-primary-foreground shadow-md"
          : "bg-muted hover:bg-muted/80"
      )}
    >
      <div className="text-base md:text-lg">{icon}</div>
      <span className="text-xs md:text-sm font-medium whitespace-nowrap">{label}</span>
    </button>
  )
}

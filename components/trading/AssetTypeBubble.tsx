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
        "flex flex-row items-center gap-2 px-4 py-2 rounded-md transition-all",
        "hover:scale-102 active:scale-98",
        isSelected
          ? "bg-primary text-primary-foreground shadow-md"
          : "bg-muted hover:bg-muted/80"
      )}
    >
      <div className="text-lg">{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}

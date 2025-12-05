export const categories = ['work', 'personal', 'health', 'finance', 'education', 'household', 'study'] as const

export function getCategoryHex(category: string): string {
  switch (category.toLowerCase().trim()) {
    case 'work':
      return '#3b82f6'
    case 'personal':
      return '#22c55e'
    case 'health':
      return '#ef4444'
    case 'finance':
      return '#eab308'
    case 'education':
      return '#a855f7'
    case 'household':
      return '#f97316'
    case 'study':
      return '#14b8a6'
    default:
      return '#6b7280'
  }
}

export function getCustomColor(hex: string, opacity: number = 100): string {
  const clamped = Math.max(0, Math.min(100, Math.round(opacity)))

  if (clamped >= 100)
    return hex

  const a = clamped / 100
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)

  return `rgba(${r}, ${g}, ${b}, ${a})`
}

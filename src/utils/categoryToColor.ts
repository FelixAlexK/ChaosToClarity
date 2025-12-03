export const categories = ['work', 'personal', 'health', 'finance', 'education', 'household', 'study'] as const

const categoriesWithDefault = [...categories, 'default'] as const

export function categoryToColor(category: string, opacity: number = 100): string {
  const map: Record<typeof categoriesWithDefault[number], string> = {
    work: '#3B82F6', // blue-500
    personal: '#10B981', // green-500
    health: '#EF4444', // red-500
    finance: '#EAB308', // yellow-500
    education: '#8B5CF6', // purple-500
    household: '#F97316', // orange-500
    study: '#14B8A6', // teal-500
    default: '#6B7280', // gray-500
  }

  const hex = map[category.toLowerCase() as typeof categoriesWithDefault[number]] ?? map.default
  const clamped = Math.max(0, Math.min(100, Math.round(opacity)))

  if (clamped >= 100)
    return hex

  const a = clamped / 100
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)

  return `rgba(${r}, ${g}, ${b}, ${a})`
}
// ...existing code...

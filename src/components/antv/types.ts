export type AntvExampleTier = 'basic' | 'advanced' | 'expert'
export type AntvVisualKind = 'table' | 'graph' | 'mobile' | 'map'

export interface AntvExampleItem {
  name: string
  category: string
  tier: AntvExampleTier
  desc: string
  url: string
  tags: string[]
}

export interface AntvProductStat {
  label: string
  value: string
}

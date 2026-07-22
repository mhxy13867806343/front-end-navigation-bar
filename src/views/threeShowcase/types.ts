export type ThreeCategory = 'basic' | 'advanced' | 'shader' | 'game' | 'experiment'
export type ThreeDifficulty = 'easy' | 'medium' | 'hard'
export type ThreeParameterType = 'range' | 'toggle' | 'select' | 'color'

export interface ThreeExampleParameter {
  key: string
  label: string
  type: ThreeParameterType
  min?: number
  max?: number
  step?: number
  value: string | number | boolean
  options?: Array<{ label: string; value: string | number }>
}

export interface ThreeCodeBlock {
  title: string
  language: string
  content: string
}

export interface ThreeExampleMeta {
  id: string
  title: string
  category: ThreeCategory
  difficulty: ThreeDifficulty
  summary: string
  tags: string[]
  coverType: 'gradient' | 'canvas-preview'
  accent: string
  routeMode?: 'example' | 'lab'
}

export interface ThreeExampleDetail extends ThreeExampleMeta {
  sceneType: string
  heroLabel: string
  knowledgePoints: string[]
  useCases: string[]
  parameters: ThreeExampleParameter[]
  codeBlocks: ThreeCodeBlock[]
}

export interface ThreeLearningStep {
  title: string
  description: string
}

export interface ThreeLabGame extends ThreeExampleDetail {
  controlHint: string
  scoreRule: string
}

import type { Component } from 'vue'

export type DynamicFormValue = string | number | boolean | null | string[]

export interface DynamicOption {
  label: string
  value: string | number | boolean
}

export interface DynamicStyle {
  width?: string
  borderStyle?: string
  borderColor?: string
  borderRadius?: number
  backgroundColor?: string
  fontSize?: number
  color?: string
  marginBottom?: number
}

export interface DynamicAnimation {
  type: string
  duration: number
}

export interface DynamicValidation {
  type: string
  pattern: string
  message: string
}

export interface DynamicEvents {
  type?: string
  value?: string
}

export interface DynamicProps {
  [key: string]: DynamicFormValue | DynamicOption[] | DynamicStyle | Record<string, unknown> | undefined
  label?: string
  field?: string
  text?: string
  buttonType?: string
  placeholder?: string
  defaultValue?: string
  maxlength?: number | null
  showWordLimit?: boolean
  clearable?: boolean
  readonly?: boolean
  required?: boolean
  disabled?: boolean
  min?: number | null
  max?: number | null
  step?: number
  precision?: number
  controls?: boolean
  controlsPosition?: string
  multiple?: boolean
  options?: DynamicOption[]
  size?: string
  type?: string
  action?: string
  accept?: string
  autosize?: boolean | Record<string, number>
  icon?: string
  onClick?: string
  modelValue?: DynamicFormValue
}

export interface DynamicFormItem {
  id: string
  type: string
  label: string
  field: string
  icon?: string | Component
  props: DynamicProps
  style: DynamicStyle
  animation: DynamicAnimation
  events?: DynamicEvents
  validation: DynamicValidation
  buttonType?: string
  text?: string
  required?: boolean
  disabled?: boolean
  size?: string
}

export interface DynamicComponentConfig {
  type: string
  label: string
  icon?: string | Component
  props: DynamicProps
}

export interface DynamicFormPayload {
  items: DynamicFormItem[]
  layout: {
    labelWidth: string
    size: string
  }
}

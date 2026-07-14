export interface ToolItem {
  [key: string]: string | boolean | string[] | number | undefined | { menuIcon?: string; menuName?: string }
  id: string
  name: string
  icon?: string
  desc: string
  status?: string
  link?: string
  needVPN?: boolean
  price?: string
  region?: string
  platform?: string
  subType?: string
  type?: string
  menuInfo?: {
    menuIcon?: string
    menuName?: string
  }
}

export interface ToolSubcategory {
  id: number | string
  name: string
  icon?: string
  tools: ToolItem[]
}

export interface NavigationCategory {
  id: number | string
  name: string
  icon: string
  type?: string
  tools?: ToolItem[]
  subcategories?: ToolSubcategory[]
}

export interface WorkItem {
  id?: string | number
  name: string
  icon?: string
  logo?: string
  desc: string
  link?: string
  type?: string
  component?: string
  tags?: string[]
  status?: string
  date?: string
}

export type NavigationList = NavigationCategory[]
export type WorkList = WorkItem[]

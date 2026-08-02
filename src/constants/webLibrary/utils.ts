import type { WebLibraryItem, WebLibraryGroup } from './pagesAndGames'

export interface WebLibraryTreeNode {
  id: string
  label: string
  command?: string
  children?: WebLibraryTreeNode[]
}

export const mapItemToTreeNode = (item: WebLibraryItem, parentId: string, idx: number): WebLibraryTreeNode => ({
  id: `${parentId}-${idx}`,
  label: item.label,
  command: item.command,
  children: item.children?.map((sub: WebLibraryItem, subIdx: number): WebLibraryTreeNode => mapItemToTreeNode(sub, `${parentId}-${idx}`, subIdx))
})

export function buildWebLibraryTreeDataFromGroups(groups: WebLibraryGroup[]): WebLibraryTreeNode[] {
  return groups.map((group: WebLibraryGroup): WebLibraryTreeNode => ({
    id: group.id,
    label: `${group.icon} ${group.title}`,
    children: group.items.map((item: WebLibraryItem, idx: number): WebLibraryTreeNode => mapItemToTreeNode(item, group.id, idx))
  }))
}

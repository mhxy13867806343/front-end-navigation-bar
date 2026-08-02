import {
  newPagesGroup,
  gamesGroup,
  aiNewsGroup,
  type WebLibraryGroup
} from './webLibrary/pagesAndGames'
import {
  mediaToolsGroup,
  componentsGroup,
  effectsGroup
} from './webLibrary/mediaAndComponents'
import {
  mapsChartsGroup,
  engineeringGroup,
  systemStatusGroup,
  docsGroup
} from './webLibrary/engineeringAndDocs'
import {
  buildWebLibraryTreeDataFromGroups,
  type WebLibraryTreeNode
} from './webLibrary/utils'

export * from './webLibrary/pagesAndGames'
export * from './webLibrary/mediaAndComponents'
export * from './webLibrary/engineeringAndDocs'
export * from './webLibrary/utils'

export const webLibraryGroups: WebLibraryGroup[] = [
  newPagesGroup,
  gamesGroup,
  aiNewsGroup,
  mediaToolsGroup,
  componentsGroup,
  effectsGroup,
  mapsChartsGroup,
  engineeringGroup,
  systemStatusGroup,
  docsGroup
]

export function buildWebLibraryTreeData(): WebLibraryTreeNode[] {
  return buildWebLibraryTreeDataFromGroups(webLibraryGroups)
}

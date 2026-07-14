
import { menuItemsList } from '@/utlis/menuItems'

export function useDatabase() {
  const menuItems = ref(menuItemsList)
  const isHomeLive = ref(false)
  const isHomeLoading = ref(false)

  const parseHomeHtml = (htmlText) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlText, 'text/html')
    
    const sidebarItems = doc.querySelectorAll('.sidebar-menu-inner > ul > li.sidebar-item')
    if (sidebarItems.length === 0) return []
    
    const parsedMenuItems = []
    
    sidebarItems.forEach((li) => {
      const parentA = li.querySelector('a')
      if (!parentA) return
      const hrefAttr = parentA.getAttribute('href')
      if (!hrefAttr || !hrefAttr.startsWith('#term-')) return
      
      const catName = parentA.querySelector('span')?.textContent.trim() || ''
      const catAnchor = hrefAttr.replace('#', '')
      
      const subUl = li.querySelector('ul')
      const subcategories = []
      
      if (subUl) {
        const subLinks = subUl.querySelectorAll('li a')
        subLinks.forEach(subA => {
          const subHref = subA.getAttribute('href')
          if (subHref && subHref.startsWith('#term-')) {
            const subName = subA.querySelector('span')?.textContent.trim() || subA.textContent.trim()
            const subAnchor = subHref.replace('#', '')
            
            const bodyTabLink = doc.getElementById(subAnchor)
            let tabId = subAnchor.replace('term-', 'tab-')
            if (bodyTabLink) {
              const hrefVal = bodyTabLink.getAttribute('href')
              if (hrefVal) tabId = hrefVal.replace('#', '')
            }
            
            const tabPane = doc.getElementById(tabId)
            const tools = []
            
            if (tabPane) {
              const cards = tabPane.querySelectorAll('.url-card')
              cards.forEach(card => {
                const a = card.querySelector('a')
                if (!a) return
                const nameEl = a.querySelector('strong')
                const name = nameEl ? nameEl.textContent.trim() : a.getAttribute('title') || ''
                if (!name) return
                const descEl = a.querySelector('p.text-muted')
                const desc = descEl ? descEl.textContent.trim() : ''
                const link = a.getAttribute('data-url') || a.getAttribute('href') || ''
                const img = a.querySelector('img')
                const icon = img ? (img.getAttribute('data-src') || img.getAttribute('src') || '') : ''
                
                tools.push({
                  id: `live-tool-${Math.random().toString(36).substr(2, 9)}`,
                  name,
                  link,
                  icon,
                  desc,
                  status: 'Free',
                  needVPN: false,
                  price: '免费',
                  region: '国内'
                })
              })
            }
            
            if (tools.length > 0) {
              subcategories.push({
                id: subAnchor,
                name: subName,
                tools
              })
            }
          }
        })
      }
      
      let tools = []
      if (subcategories.length === 0) {
        const headerIcon = doc.getElementById(catAnchor)
        if (headerIcon) {
          const headerEl = headerIcon.parentElement
          let rowEl = null
          let nextSibling = headerEl.nextElementSibling || headerEl.parentElement?.nextElementSibling
          for (let k = 0; k < 5; k++) {
            if (nextSibling) {
              if (nextSibling.classList.contains('row')) {
                rowEl = nextSibling
                break
              }
              const subRow = nextSibling.querySelector('.row')
              if (subRow) {
                rowEl = subRow
                break
              }
              nextSibling = nextSibling.nextElementSibling
            }
          }
          
          if (rowEl) {
            const cards = rowEl.querySelectorAll('.url-card')
            cards.forEach(card => {
              const a = card.querySelector('a')
              if (!a) return
              const nameEl = a.querySelector('strong')
              const name = nameEl ? nameEl.textContent.trim() : a.getAttribute('title') || ''
              if (!name) return
              const descEl = a.querySelector('p.text-muted')
              const desc = descEl ? descEl.textContent.trim() : ''
              const link = a.getAttribute('data-url') || a.getAttribute('href') || ''
              const img = a.querySelector('img')
              const icon = img ? (img.getAttribute('data-src') || img.getAttribute('src') || '') : ''
              
              tools.push({
                id: `live-tool-${Math.random().toString(36).substr(2, 9)}`,
                name,
                link,
                icon,
                desc,
                status: 'Free',
                needVPN: false,
                price: '免费',
                region: '国内'
              })
            })
          }
        }
      }
      
      if (subcategories.length > 0 || tools.length > 0) {
        parsedMenuItems.push({
          id: catAnchor,
          name: catName,
          icon: '🔗',
          subcategories: subcategories.length > 0 ? subcategories : undefined,
          tools: tools.length > 0 ? tools : undefined
        })
      }
    })
    
    return parsedMenuItems
  }

  const mergeMenuItems = (liveData, staticData) => {
    const staticToolsMap = {}
    staticData.forEach(cat => {
      if (cat.tools) {
        cat.tools.forEach(t => {
          staticToolsMap[t.name.toLowerCase()] = t
        })
      }
      if (cat.subcategories) {
        cat.subcategories.forEach(sub => {
          sub.tools.forEach(t => {
            staticToolsMap[t.name.toLowerCase()] = t
          })
        })
      }
    })
    
    const merged = liveData.map((liveCat) => {
      const staticCat = staticData.find(c => c.name === liveCat.name)
      const catIcon = staticCat ? staticCat.icon : '🔗'
      const catId = staticCat ? staticCat.id : liveCat.id
      
      if (liveCat.subcategories) {
        const mergedSubs = liveCat.subcategories.map(liveSub => {
          const mergedTools = liveSub.tools.map(liveTool => {
            const staticTool = staticToolsMap[liveTool.name.toLowerCase()]
            if (staticTool) {
              return {
                ...staticTool,
                link: liveTool.link || staticTool.link,
                desc: liveTool.desc || staticTool.desc
              }
            }
            return liveTool
          })
          return {
            id: liveSub.id,
            name: liveSub.name,
            tools: mergedTools
          }
        })
        
        return {
          id: catId,
          name: liveCat.name,
          icon: catIcon,
          subcategories: mergedSubs
        }
      } else {
        const mergedTools = (liveCat.tools || []).map(liveTool => {
          const staticTool = staticToolsMap[liveTool.name.toLowerCase()]
          if (staticTool) {
            return {
              ...staticTool,
              link: liveTool.link || staticTool.link,
              desc: liveTool.desc || staticTool.desc
            }
          }
          return liveTool
        })
        
        return {
          id: catId,
          name: liveCat.name,
          icon: catIcon,
          tools: mergedTools
        }
      }
    })
    
    const apiToolboxCat = staticData.find(c => c.id === 24)
    if (apiToolboxCat && !merged.some(c => c.id === 24)) {
      merged.push(apiToolboxCat)
    }
    const showcaseCat = staticData.find(c => c.id === 25)
    if (showcaseCat && !merged.some(c => c.id === 25)) {
      merged.push(showcaseCat)
    }
    return merged
  }

  const fetchHomeDatabase = async () => {
    isHomeLoading.value = true
    const targetUrls = [
      '/api-home',
      'https://api.codetabs.com/v1/proxy?quest=https://ai-bot.cn/',
      'https://api.allorigins.win/raw?url=https://ai-bot.cn/'
    ]
    let success = false
    for (const url of targetUrls) {
      try {
        const response = await fetch(url, { headers: { 'Accept': 'text/html' } })
        if (response.ok) {
          const htmlText = await response.text()
          const parsed = parseHomeHtml(htmlText)
          if (parsed && parsed.length > 0) {
            menuItems.value = mergeMenuItems(parsed, menuItemsList)
            isHomeLive.value = true
            success = true
            break
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch home database from ${url}:`, err.message)
      }
    }
    if (!success) {
      menuItems.value = [...menuItemsList]
      isHomeLive.value = false
    }
    isHomeLoading.value = false
  }

  return {
    menuItems,
    isHomeLive,
    isHomeLoading,
    fetchHomeDatabase
  }
}

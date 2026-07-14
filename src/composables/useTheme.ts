import type { Ref } from 'vue'

interface UseThemeReturn {
  isDarkMode: Ref<boolean>
  showThemeDropdown: Ref<boolean>
  toggleTheme: () => void
  toggleThemeDropdown: (otherDropdowns?: Array<() => void>) => void
}

export function useTheme(): UseThemeReturn {
  const getInitialTheme = (): boolean => {
    const theme: string | null = localStorage.getItem('theme')
    if (theme) {
      return theme === 'dark'
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  
  const isDarkMode = ref<boolean>(getInitialTheme())
  const showThemeDropdown = ref<boolean>(false)
  
  const toggleTheme = (): void => {
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', isDarkMode.value)
  }
  
  const toggleThemeDropdown = (otherDropdowns: Array<() => void> = []): void => {
    showThemeDropdown.value = !showThemeDropdown.value
    otherDropdowns.forEach((cb: () => void): void => cb())
  }
  
  return {
    isDarkMode,
    showThemeDropdown,
    toggleTheme,
    toggleThemeDropdown
  }
}

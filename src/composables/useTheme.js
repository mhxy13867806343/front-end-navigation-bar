import { ref } from 'vue'

export function useTheme() {
  const getInitialTheme = () => {
    const theme = localStorage.getItem('theme')
    if (theme) {
      return theme === 'dark'
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  
  const isDarkMode = ref(getInitialTheme())
  const showThemeDropdown = ref(false)
  
  const toggleTheme = () => {
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', isDarkMode.value)
  }
  
  const toggleThemeDropdown = (otherDropdowns = []) => {
    showThemeDropdown.value = !showThemeDropdown.value
    otherDropdowns.forEach(cb => cb())
  }
  
  return {
    isDarkMode,
    showThemeDropdown,
    toggleTheme,
    toggleThemeDropdown
  }
}

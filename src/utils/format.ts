/**
 * Common formatting utility functions for numbers, dates, strings and HTML
 */

/**
 * Format count numbers to human-readable strings (e.g., 10000 -> 1.0w, 1200 -> 1.2k)
 */
export function formatNumber(n: number): string {
  if (!n || isNaN(n)) return '0'
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

/**
 * Strip HTML tags from a string and return plain text
 */
export function stripHtml(html: string): string {
  if (!html) return ''
  if (typeof document !== 'undefined') {
    const div: HTMLDivElement = document.createElement('div')
    div.innerHTML = html
    return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim()
  }
  return html.replace(/<[^>]*>/g, '').trim()
}

/**
 * Truncate a text string to a maximum length with ellipsis
 */
export function truncateText(str: string, maxLength: number): string {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return `${str.slice(0, maxLength)}...`
}

/**
 * Format a Date or timestamp string into YYYY-MM-DD or custom format
 */
export function formatDate(dateInput: Date | string | number, showTime: boolean = false): string {
  if (!dateInput) return ''
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return String(dateInput)

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  if (!showTime) {
    return `${year}-${month}-${day}`
  }

  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

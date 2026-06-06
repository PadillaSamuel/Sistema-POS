export const formateador = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
})

export const NOMBRE_WRAP_CHARS = 24

export const wrapByWords = (text, maxChars = NOMBRE_WRAP_CHARS) => {
  if (!text) return ''
  const words = String(text).split(/\s+/).filter(Boolean)
  const lines = []
  let current = ''
  for (const word of words) {
    let remaining = word
    while (remaining.length > maxChars) {
      if (current) {
        lines.push(current)
        current = ''
      }
      lines.push(remaining.slice(0, maxChars))
      remaining = remaining.slice(maxChars)
    }
    if (current === '') {
      current = remaining
    } else if (current.length + 1 + remaining.length <= maxChars) {
      current = `${current} ${remaining}`
    } else {
      lines.push(current)
      current = remaining
    }
  }
  if (current) lines.push(current)
  return lines.join('\n')
}

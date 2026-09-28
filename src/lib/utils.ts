import { type ClassValue, clsx } from 'clsx'
import { format } from 'date-fns'
import { enUS, pl } from 'date-fns/locale'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Date helpers ────────────────────────────────────────────────────────────

export function getDateFnsLocale(lang: string) {
  return lang === 'pl' ? pl : enUS
}

export function formatDate(date: Date, formatStr: string, lang: string): string {
  return format(date, formatStr, { locale: getDateFnsLocale(lang) })
}

export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function toJiraDateTimeString(date: Date): string {
  // Jira expects: "2021-01-17T12:34:00.000+0000"
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  const y = date.getFullYear()
  const mo = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  const h = pad(date.getHours())
  const mi = pad(date.getMinutes())
  const s = pad(date.getSeconds())
  const ms = String(date.getMilliseconds()).padStart(3, '0')
  const tzOffset = -date.getTimezoneOffset()
  const tzSign = tzOffset >= 0 ? '+' : '-'
  const tzH = pad(Math.floor(Math.abs(tzOffset) / 60))
  const tzM = pad(Math.abs(tzOffset) % 60)
  return `${y}-${mo}-${d}T${h}:${mi}:${s}.${ms}${tzSign}${tzH}${tzM}`
}

/** Get the start of day (midnight) for a given date, as a Date object */
export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Get the end of day (23:59:59.999) for a given date */
export function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

// ─── Time formatting ─────────────────────────────────────────────────────────

export function hoursToSeconds(hours: number): number {
  return Math.round(hours * 3600)
}

export function secondsToHours(seconds: number): number {
  return seconds / 3600
}

export function formatSeconds(seconds: number): string {
  if (seconds <= 0) return ''
  const totalMinutes = Math.round(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h`
  return `${minutes}m`
}

export function formatHoursDecimal(seconds: number): string {
  if (seconds <= 0) return ''
  const hours = seconds / 3600
  return hours % 1 === 0 ? `${hours}h` : `${hours.toFixed(2)}h`
}

// ─── ADF (Atlassian Document Format) helpers ─────────────────────────────────

export interface AdfDocument {
  type: 'doc'
  version: 1
  content: AdfNode[]
}

export interface AdfNode {
  type: string
  content?: AdfNode[]
  text?: string
  [key: string]: unknown
}

export function buildAdfComment(text: string): AdfDocument {
  return {
    type: 'doc',
    version: 1,
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: text,
          },
        ],
      },
    ],
  }
}

export function parseAdfToText(adf: unknown): string {
  if (!adf) return ''
  if (typeof adf === 'string') return adf

  const doc = adf as AdfDocument
  if (!doc.content) return ''

  function extractText(nodes: AdfNode[]): string {
    return nodes
      .map((node) => {
        if (node.type === 'text' && node.text) return node.text
        if (node.content) return extractText(node.content)
        if (node.type === 'hardBreak') return '\n'
        return ''
      })
      .join('')
  }

  return extractText(doc.content).trim()
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 1) + '…'
}

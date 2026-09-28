import { buildAdfComment } from '@/lib/utils'
import { getAxios } from './axios'
import type { Worklog } from './types'

export async function addWorklog(
  issueKey: string,
  started: Date,
  timeSpentSeconds: number,
  comment?: string
): Promise<Worklog> {
  const axios = getAxios()
  const body: Record<string, unknown> = {
    started: toJiraStarted(started),
    timeSpentSeconds,
  }
  if (comment?.trim()) {
    body.comment = buildAdfComment(comment.trim())
  }
  const response = await axios.post<Worklog>(`/issue/${issueKey}/worklog`, body, {
    params: { adjustEstimate: 'leave' },
  })
  return response.data
}

export async function updateWorklog(
  issueKey: string,
  worklogId: string,
  timeSpentSeconds: number,
  comment?: string
): Promise<Worklog> {
  const axios = getAxios()
  const body: Record<string, unknown> = {
    timeSpentSeconds,
  }
  if (comment !== undefined) {
    body.comment = comment.trim() ? buildAdfComment(comment.trim()) : buildAdfComment('')
  }
  const response = await axios.put<Worklog>(
    `/issue/${issueKey}/worklog/${worklogId}`,
    body,
    { params: { adjustEstimate: 'leave' } }
  )
  return response.data
}

export async function deleteWorklog(
  issueKey: string,
  worklogId: string
): Promise<void> {
  const axios = getAxios()
  await axios.delete(`/issue/${issueKey}/worklog/${worklogId}`, {
    params: { adjustEstimate: 'leave' },
  })
}

// Jira expects: "2021-01-17T12:34:00.000+0000"
function toJiraStarted(date: Date): string {
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

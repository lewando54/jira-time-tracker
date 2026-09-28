import { format } from 'date-fns'
import { getAxios } from './axios'
import type {
  IssuePickerResult,
  JiraIssue,
  PageOfWorklogs,
  SearchResult,
  Worklog,
} from './types'

export async function searchIssuesWithWorklogs(
  accountId: string,
  start: Date,
  end: Date
): Promise<JiraIssue[]> {
  const axios = getAxios()
  const startStr = format(start, 'yyyy-MM-dd')
  const endStr = format(end, 'yyyy-MM-dd')
  const jql = `worklogAuthor = "${accountId}" AND worklogDate >= "${startStr}" AND worklogDate <= "${endStr}" ORDER BY updated DESC`

  const allIssues: JiraIssue[] = []
  let nextPageToken: string | undefined = undefined

  do {
    const body: Record<string, unknown> = {
      jql,
      fields: ['summary', 'issuetype', 'project'],
      maxResults: 100,
    }
    if (nextPageToken) {
      body.nextPageToken = nextPageToken
    }

    const response = await axios.post<SearchResult>('/search/jql', body)
    allIssues.push(...response.data.issues)
    nextPageToken = response.data.isLast ? undefined : response.data.nextPageToken
  } while (nextPageToken)

  return allIssues
}

export async function getIssueDetails(issueKey: string): Promise<JiraIssue> {
  const axios = getAxios()
  const response = await axios.get<JiraIssue>(`/issue/${issueKey}`, {
    params: { fields: 'summary,issuetype,project' },
  })
  return response.data
}

export async function getIssueWorklogs(
  issueKey: string,
  startMs: number,
  endMs: number
): Promise<Worklog[]> {
  const axios = getAxios()
  const allWorklogs: Worklog[] = []
  let startAt = 0
  const maxResults = 5000

  // Fetch all pages
  while (true) {
    const response = await axios.get<PageOfWorklogs>(`/issue/${issueKey}/worklog`, {
      params: {
        startedAfter: startMs,
        startedBefore: endMs,
        startAt,
        maxResults,
      },
    })
    const { worklogs, total } = response.data
    allWorklogs.push(...worklogs)
    startAt += worklogs.length
    if (startAt >= total) break
  }

  return allWorklogs
}

export async function searchIssues(query: string): Promise<IssuePickerResult> {
  const axios = getAxios()
  const response = await axios.get<IssuePickerResult>('/issue/picker', {
    params: { query, showSubTasks: true },
  })
  return response.data
}

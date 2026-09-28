// ─── Jira API types ───────────────────────────────────────────────────────────

export interface JiraUser {
  accountId: string
  displayName: string
  emailAddress: string
  active: boolean
  avatarUrls: {
    '16x16': string
    '24x24': string
    '32x32': string
    '48x48': string
  }
  timeZone?: string
  self: string
}

export interface IssueType {
  id: string
  name: string
  description?: string
  iconUrl: string
  avatarId?: number
  subtask: boolean
  hierarchyLevel?: number
}

export interface JiraProject {
  id: string
  key: string
  name: string
  avatarUrls?: Record<string, string>
}

export interface JiraIssue {
  id: string
  key: string
  self: string
  fields: {
    summary: string
    issuetype: IssueType
    project: JiraProject
    worklog?: PageOfWorklogs
  }
}

export interface WorklogAuthor {
  accountId: string
  displayName: string
  active: boolean
  avatarUrls?: Record<string, string>
  self: string
}

export interface Worklog {
  id: string
  issueId: string
  self: string
  author: WorklogAuthor
  updateAuthor?: WorklogAuthor
  comment?: unknown // ADF document
  started: string // ISO string
  timeSpent: string // e.g. "3h 20m"
  timeSpentSeconds: number
  updated: string
}

export interface PageOfWorklogs {
  startAt: number
  maxResults: number
  total: number
  worklogs: Worklog[]
}

export interface SearchResult {
  isLast: boolean
  nextPageToken?: string
  issues: JiraIssue[]
}

export interface IssuePickerIssue {
  id: number
  key: string
  summary: string
  img: string
}

export interface IssuePickerSection {
  id: string
  label: string
  sub?: string
  issues: IssuePickerIssue[]
}

export interface IssuePickerResult {
  sections: IssuePickerSection[]
}

// ─── App-specific types ───────────────────────────────────────────────────────

/** Merged issue used in the time matrix — combines API data + pinned state */
export interface MatrixIssue {
  key: string
  summary: string
  issueType: IssueType
  projectKey: string
  spaceUrl: string
}

export interface AddWorklogPayload {
  issueKey: string
  started: string // ISO string
  timeSpentSeconds: number
  comment?: string
}

export interface UpdateWorklogPayload {
  issueKey: string
  worklogId: string
  timeSpentSeconds: number
  comment?: string
}

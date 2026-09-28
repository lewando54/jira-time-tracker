import { JiraUser } from './types'
import { getAxios } from './axios'

export async function getCurrentUser(): Promise<JiraUser> {
  const axios = getAxios()
  const response = await axios.get<JiraUser>('/myself')
  return response.data
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TasksState {
  pinnedTaskKeys: string[]
  pinTask: (key: string) => void
  unpinTask: (key: string) => void
  isPinned: (key: string) => boolean
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      pinnedTaskKeys: [],
      pinTask: (key) => {
        const { pinnedTaskKeys } = get()
        if (!pinnedTaskKeys.includes(key)) {
          set({ pinnedTaskKeys: [...pinnedTaskKeys, key] })
        }
      },
      unpinTask: (key) => {
        set({ pinnedTaskKeys: get().pinnedTaskKeys.filter((k) => k !== key) })
      },
      isPinned: (key) => get().pinnedTaskKeys.includes(key),
    }),
    {
      name: 'jira-pinned-tasks',
    }
  )
)

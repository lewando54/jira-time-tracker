import { PeriodSelector } from './PeriodSelector'
import { TaskSearchBar } from './TaskSearchBar'
import { TimeMatrix } from './TimeMatrix'

export function Dashboard() {
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-[var(--color-border)] bg-[var(--color-surface)] shrink-0 gap-4">
        <PeriodSelector />
        <TaskSearchBar />
      </div>

      {/* Matrix */}
      <div className="flex-1 overflow-hidden">
        <TimeMatrix />
      </div>
    </div>
  )
}

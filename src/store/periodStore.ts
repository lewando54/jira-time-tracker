import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  getISOWeek,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns'
import { create } from 'zustand'

export type PeriodView = 'week' | 'month'

interface PeriodRange {
  start: Date
  end: Date
}

function computeRange(view: PeriodView, referenceDate: Date): PeriodRange {
  if (view === 'week') {
    return {
      start: startOfWeek(referenceDate, { weekStartsOn: 1 }),
      end: endOfWeek(referenceDate, { weekStartsOn: 1 }),
    }
  }
  return {
    start: startOfMonth(referenceDate),
    end: endOfMonth(referenceDate),
  }
}

function computeDays(range: PeriodRange): Date[] {
  return eachDayOfInterval({ start: range.start, end: range.end })
}

interface PeriodState {
  view: PeriodView
  referenceDate: Date
  // Stable computed values — only change when view or referenceDate changes
  periodRange: PeriodRange
  daysInPeriod: Date[]
  weekNumber: number
  setView: (view: PeriodView) => void
  goNext: () => void
  goPrev: () => void
  setReferenceDate: (date: Date) => void
}

const initialRef = new Date()
const initialView: PeriodView = 'week'
const initialRange = computeRange(initialView, initialRef)

export const usePeriodStore = create<PeriodState>()((set) => ({
  view: initialView,
  referenceDate: initialRef,
  periodRange: initialRange,
  daysInPeriod: computeDays(initialRange),
  weekNumber: getISOWeek(initialRef),

  setView: (view) =>
    set((state) => {
      const range = computeRange(view, state.referenceDate)
      return {
        view,
        periodRange: range,
        daysInPeriod: computeDays(range),
        weekNumber: getISOWeek(state.referenceDate),
      }
    }),

  goNext: () =>
    set((state) => {
      const next =
        state.view === 'week'
          ? addWeeks(state.referenceDate, 1)
          : addMonths(state.referenceDate, 1)
      const range = computeRange(state.view, next)
      return {
        referenceDate: next,
        periodRange: range,
        daysInPeriod: computeDays(range),
        weekNumber: getISOWeek(next),
      }
    }),

  goPrev: () =>
    set((state) => {
      const prev =
        state.view === 'week'
          ? subWeeks(state.referenceDate, 1)
          : subMonths(state.referenceDate, 1)
      const range = computeRange(state.view, prev)
      return {
        referenceDate: prev,
        periodRange: range,
        daysInPeriod: computeDays(range),
        weekNumber: getISOWeek(prev),
      }
    }),

  setReferenceDate: (date) =>
    set((state) => {
      const range = computeRange(state.view, date)
      return {
        referenceDate: date,
        periodRange: range,
        daysInPeriod: computeDays(range),
        weekNumber: getISOWeek(date),
      }
    }),
}))

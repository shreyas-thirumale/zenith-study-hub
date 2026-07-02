'use client'

import { useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'

interface Course {
  id: number
  name: string
  code: string
  color: string
  days: string[]
  start_time: string | null
  end_time: string | null
  location: string | null
}

interface CalendarEvent {
  id: number
  title: string
  date: string
  time?: string
  type: string
  description?: string
  course_id?: number
}

interface WeeklyViewProps {
  courses: Course[]
  events: CalendarEvent[]
  currentWeekStart: Date
  onPrevWeek: () => void
  onNextWeek: () => void
  onToday: () => void
  onSlotClick: (_date: Date, _hour: number) => void
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_KEYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const HOURS = Array.from({ length: 24 }, (_, i) => i)
const SLOT_HEIGHT = 60 // px per hour

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + (m || 0)
}

function formatHour(h: number): string {
  if (h === 0) return '12 AM'
  if (h < 12) return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  assignment: 'bg-blue-500/20 border-blue-500 text-blue-400',
  exam:       'bg-red-500/20 border-red-500 text-red-400',
  presentation: 'bg-purple-500/20 border-purple-500 text-purple-400',
  reading:    'bg-yellow-500/20 border-yellow-500 text-yellow-400',
  custom:     'bg-gray-500/20 border-gray-500 text-gray-400',
}

export function WeeklyView({
  courses,
  events,
  currentWeekStart,
  onPrevWeek,
  onNextWeek,
  onToday,
  onSlotClick,
}: WeeklyViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to 7 AM on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7 * SLOT_HEIGHT
    }
  }, [])

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart)
    d.setDate(currentWeekStart.getDate() + i)
    return d
  })

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  // Derive week label
  const firstDay = weekDays[0]
  const lastDay  = weekDays[6]
  const weekLabel =
    firstDay.getMonth() === lastDay.getMonth()
      ? `${monthNames[firstDay.getMonth()]} ${firstDay.getFullYear()}`
      : `${monthNames[firstDay.getMonth()]} – ${monthNames[lastDay.getMonth()]} ${lastDay.getFullYear()}`

  // Current time indicator
  const nowMinutes = today.getHours() * 60 + today.getMinutes()
  const nowTop = (nowMinutes / 60) * SLOT_HEIGHT

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onToday} className="hover-lift text-xs px-3">
            Today
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 hover-lift" onClick={onPrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 hover-lift" onClick={onNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-lg font-semibold">{weekLabel}</h2>
        <div className="w-32" /> {/* spacer */}
      </div>

      {/* Day header row */}
      <div className="flex border-b border-border/50">
        {/* Time gutter */}
        <div className="w-14 shrink-0" />
        {weekDays.map((day, i) => {
          const dateStr = day.toISOString().split('T')[0]
          const isToday = dateStr === todayStr
          return (
            <div key={i} className="flex-1 text-center py-2 border-l border-border/30">
              <div className="text-xs text-muted-foreground font-medium">{DAY_LABELS[i]}</div>
              <div className={`
                text-sm font-bold mx-auto mt-0.5 w-8 h-8 flex items-center justify-center rounded-full
                ${isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'}
              `}>
                {day.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      {/* Scrollable grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative">
        <div className="flex" style={{ height: `${SLOT_HEIGHT * 24}px` }}>
          {/* Time gutter */}
          <div className="w-14 shrink-0 relative">
            {HOURS.map(h => (
              <div
                key={h}
                className="absolute right-2 text-xs text-muted-foreground"
                style={{ top: h * SLOT_HEIGHT - 8, height: SLOT_HEIGHT }}
              >
                {h === 0 ? '' : formatHour(h)}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, colIdx) => {
            const dateStr = day.toISOString().split('T')[0]
            const isToday = dateStr === todayStr
            const dayKey = DAY_KEYS[day.getDay()]

            // Recurring class blocks for this day
            const classBlocks = courses.filter(c =>
              c.days?.includes(dayKey) && c.start_time && c.end_time
            )

            // One-off events for this day that have a time
            const dayEvents = events.filter(e => e.date === dateStr && e.time)

            return (
              <div
                key={colIdx}
                className="flex-1 border-l border-border/30 relative"
                style={{ height: `${SLOT_HEIGHT * 24}px` }}
              >
                {/* Hour grid lines */}
                {HOURS.map(h => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-border/20 cursor-pointer hover:bg-accent/10 transition-colors"
                    style={{ top: h * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                    onClick={() => onSlotClick(day, h)}
                  />
                ))}

                {/* Half-hour lines */}
                {HOURS.map(h => (
                  <div
                    key={`half-${h}`}
                    className="absolute w-full border-t border-border/10"
                    style={{ top: h * SLOT_HEIGHT + SLOT_HEIGHT / 2, height: 0 }}
                  />
                ))}

                {/* Today indicator */}
                {isToday && (
                  <div
                    className="absolute w-full z-20 pointer-events-none"
                    style={{ top: nowTop }}
                  >
                    <div className="relative flex items-center">
                      <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shrink-0" />
                      <div className="flex-1 h-px bg-red-500" />
                    </div>
                  </div>
                )}

                {/* Recurring class blocks */}
                {classBlocks.map(course => {
                  const startMin = timeToMinutes(course.start_time!)
                  const endMin   = timeToMinutes(course.end_time!)
                  const top    = (startMin / 60) * SLOT_HEIGHT
                  const height = ((endMin - startMin) / 60) * SLOT_HEIGHT

                  return (
                    <div
                      key={`course-${course.id}`}
                      className="absolute left-0.5 right-0.5 rounded-md px-1.5 py-1 text-xs overflow-hidden z-10 border-l-2 cursor-pointer transition-opacity hover:opacity-90"
                      style={{
                        top: top + 1,
                        height: Math.max(height - 2, 20),
                        backgroundColor: course.color + '30',
                        borderColor: course.color,
                        color: course.color,
                      }}
                      title={`${course.name} (${course.code})\n${course.start_time} – ${course.end_time}${course.location ? '\n' + course.location : ''}`}
                    >
                      <div className="font-semibold truncate leading-tight">{course.code}</div>
                      {height > 36 && (
                        <div className="truncate opacity-80 leading-tight">{course.name}</div>
                      )}
                      {height > 52 && course.location && (
                        <div className="truncate opacity-60 leading-tight">{course.location}</div>
                      )}
                    </div>
                  )
                })}

                {/* One-off timed events */}
                {dayEvents.map(event => {
                  const startMin = timeToMinutes(event.time!)
                  const top = (startMin / 60) * SLOT_HEIGHT
                  const colorClass = EVENT_TYPE_COLORS[event.type] ?? EVENT_TYPE_COLORS.custom

                  return (
                    <div
                      key={`event-${event.id}`}
                      className={`absolute left-0.5 right-0.5 rounded-md px-1.5 py-1 text-xs z-10 border-l-2 cursor-pointer transition-opacity hover:opacity-90 ${colorClass}`}
                      style={{ top: top + 1, height: 28 }}
                      title={event.title}
                    >
                      <div className="font-medium truncate leading-tight">{event.title}</div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

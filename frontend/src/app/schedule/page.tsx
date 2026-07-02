'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Trash2, BookOpen } from 'lucide-react'
import { WeeklyView } from '@/components/weekly-view'
import { Navbar } from '@/components/navbar'
import { api } from '@/lib/api'
import { toast } from 'react-hot-toast'

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

const DAY_OPTIONS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

export default function SchedulePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart(new Date()))

  // Add/edit course dialog
  const [courseDialogOpen, setCourseDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [courseForm, setCourseForm] = useState({
    name: '', code: '', color: '#6366f1',
    days: [] as string[],
    start_time: '', end_time: '', location: '',
  })

  useEffect(() => {
    Promise.all([
      api.get('/courses').catch(() => ({ data: [] })),
      api.get('/calendar').catch(() => ({ data: [] })),
    ]).then(([cRes, eRes]) => {
      setCourses(cRes.data)
      setEvents(eRes.data)
    }).finally(() => setLoading(false))
  }, [])

  const openAddCourse = () => {
    setEditingCourse(null)
    setCourseForm({ name: '', code: '', color: '#6366f1', days: [], start_time: '', end_time: '', location: '' })
    setCourseDialogOpen(true)
  }

  const openEditCourse = (course: Course) => {
    setEditingCourse(course)
    setCourseForm({
      name: course.name,
      code: course.code,
      color: course.color,
      days: course.days ?? [],
      start_time: course.start_time ?? '',
      end_time: course.end_time ?? '',
      location: course.location ?? '',
    })
    setCourseDialogOpen(true)
  }

  const toggleDay = (day: string) => {
    setCourseForm(f => ({
      ...f,
      days: f.days.includes(day) ? f.days.filter(d => d !== day) : [...f.days, day],
    }))
  }

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseForm.name || !courseForm.code) {
      toast.error('Name and code are required')
      return
    }
    try {
      if (editingCourse) {
        const res = await api.put(`/courses/${editingCourse.id}`, courseForm)
        setCourses(cs => cs.map(c => c.id === editingCourse.id ? res.data : c))
        toast.success('Course updated!')
      } else {
        const res = await api.post('/courses', courseForm)
        setCourses(cs => [...cs, res.data])
        toast.success('Course added!')
      }
      setCourseDialogOpen(false)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save course')
    }
  }

  const handleDeleteCourse = async (id: number) => {
    try {
      await api.delete(`/courses/${id}`)
      setCourses(cs => cs.filter(c => c.id !== id))
      toast.success('Course removed')
    } catch {
      toast.error('Failed to delete course')
    }
  }

  const handlePrevWeek = () => {
    setWeekStart(w => { const d = new Date(w); d.setDate(d.getDate() - 7); return d })
  }
  const handleNextWeek = () => {
    setWeekStart(w => { const d = new Date(w); d.setDate(d.getDate() + 7); return d })
  }
  const handleToday = () => setWeekStart(getWeekStart(new Date()))

  const handleSlotClick = (_date: Date, _hour: number) => {
    // Future: open quick-add event dialog
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar title="Schedule" />

      {/* Action bar */}
      <div className="bg-card/30 border-b">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <p className="text-muted-foreground text-sm">Your weekly class schedule</p>
          <Button className="hover-lift" size="sm" onClick={openAddCourse}>
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </Button>
        </div>
      </div>

      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* Weekly grid */}
            <Card className="modern-card flex-1 animate-scale-in" style={{ minHeight: 600 }}>
              <CardContent className="p-4 h-full flex flex-col">
                <WeeklyView
                  courses={courses}
                  events={events}
                  currentWeekStart={weekStart}
                  onPrevWeek={handlePrevWeek}
                  onNextWeek={handleNextWeek}
                  onToday={handleToday}
                  onSlotClick={handleSlotClick}
                />
              </CardContent>
            </Card>

            {/* Courses sidebar */}
            <div className="w-64 shrink-0 space-y-3 animate-slide-left">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Classes</h3>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={openAddCourse}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {courses.length === 0 ? (
                <Card className="modern-card">
                  <CardContent className="p-4 text-center">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                    <p className="text-xs text-muted-foreground">No classes yet. Add one to see it on your schedule.</p>
                  </CardContent>
                </Card>
              ) : (
                courses.map(course => (
                  <div
                    key={course.id}
                    className="p-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-200 group cursor-pointer"
                    onClick={() => openEditCourse(course)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: course.color }} />
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{course.code}</div>
                          <div className="text-xs text-muted-foreground truncate">{course.name}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={e => { e.stopPropagation(); handleDeleteCourse(course.id) }}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                    {(course.days?.length > 0 || course.start_time) && (
                      <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                        {course.days?.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {course.days.map(d => (
                              <span key={d} className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: course.color + '25', color: course.color }}>{d}</span>
                            ))}
                          </div>
                        )}
                        {course.start_time && course.end_time && (
                          <div>{course.start_time} – {course.end_time}</div>
                        )}
                        {course.location && <div className="opacity-70">{course.location}</div>}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>

      {/* Add / Edit course dialog */}
      <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>{editingCourse ? 'Edit Class' : 'Add Class'}</DialogTitle>
            <DialogDescription>
              Set the schedule so it appears on your weekly view.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCourse}>
            <div className="space-y-4 py-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Course Name *</Label>
                  <Input
                    placeholder="Introduction to CS"
                    value={courseForm.name}
                    onChange={e => setCourseForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Code *</Label>
                  <Input
                    placeholder="CS101"
                    value={courseForm.code}
                    onChange={e => setCourseForm(f => ({ ...f, code: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Days</Label>
                <div className="flex gap-1.5 flex-wrap">
                  {DAY_OPTIONS.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
                        courseForm.days.includes(day)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={courseForm.start_time}
                    onChange={e => setCourseForm(f => ({ ...f, start_time: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={courseForm.end_time}
                    onChange={e => setCourseForm(f => ({ ...f, end_time: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input
                  placeholder="e.g. Room 204, Science Hall"
                  value={courseForm.location}
                  onChange={e => setCourseForm(f => ({ ...f, location: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={courseForm.color}
                    onChange={e => setCourseForm(f => ({ ...f, color: e.target.value }))}
                    className="w-14 h-9 p-1 cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground">Used to color the block on your schedule</span>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setCourseDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="hover-lift">
                {editingCourse ? 'Save Changes' : 'Add Class'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

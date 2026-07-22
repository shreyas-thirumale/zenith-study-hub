"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Focus, BookOpen } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useEvents, useProjects, useFocusStats, useCourses } from "@/lib/queries";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  const { data: events = [] }      = useEvents()
  const { data: projects = [] }    = useProjects()
  const { data: courses = [] }     = useCourses()
  const { data: focusStats }       = useFocusStats()

  // Upcoming events in next 7 days
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingEvents = events.filter(e => {
    const d = new Date(e.date)
    return d >= today && d <= nextWeek
  }).length

  const activeProjects = projects.filter(p => p.status === 'active').length

  return (
    <div className="min-h-screen bg-background">
      <Navbar title="Dashboard" />

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-2xl font-bold text-foreground mb-1">
            Welcome back, {user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'Student'}!
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening with your studies today
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="modern-card hover-lift animate-scale-in animate-stagger-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">Next 7 days</p>
            </CardContent>
          </Card>

          <Card className="modern-card hover-lift animate-scale-in animate-stagger-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{activeProjects}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>

          <Card className="modern-card hover-lift animate-scale-in animate-stagger-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Focus Hours</CardTitle>
              <Focus className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">
                {focusStats?.weekHours ?? 0}h
              </div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card className="modern-card hover-lift animate-scale-in animate-stagger-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{courses.length}</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="modern-card animate-slide-up animate-stagger-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                Quick Actions
              </CardTitle>
              <CardDescription>Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start hover-lift group" onClick={() => router.push("/calendar")}>
                <Calendar className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                View Calendar
              </Button>
              <Button variant="outline" className="w-full justify-start hover-lift group" onClick={() => router.push("/projects")}>
                <Users className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                View Projects
              </Button>
              <Button variant="outline" className="w-full justify-start hover-lift group" onClick={() => router.push("/focus")}>
                <Focus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Start Focus Session
              </Button>
            </CardContent>
          </Card>

          <Card className="modern-card animate-slide-up animate-stagger-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                Getting Started
              </CardTitle>
              <CardDescription>Tips to maximize your productivity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { color: 'bg-blue-500', title: 'Add your courses to organize assignments', sub: 'Start by creating courses' },
                  { color: 'bg-green-500', title: 'Track deadlines in the calendar', sub: 'Never miss an assignment' },
                  { color: 'bg-purple-500', title: 'Use focus sessions to stay productive', sub: 'Track your study time' },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200 animate-fade-in animate-stagger-${i + 1}`}>
                    <div className={`w-2 h-2 ${item.color} rounded-full`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

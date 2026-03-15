"use client"

import { useRealtimeNotes } from "@/hooks/use-realtime-notes"

export function DashboardSync() {
  useRealtimeNotes()
  return null
}

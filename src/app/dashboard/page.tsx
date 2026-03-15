"use client"

import React from "react"
import { NoteEditor } from "@/components/dashboard/NoteEditor"

export default function DashboardPage() {
  return (
    <div className="flex-1 h-full overflow-hidden">
      <NoteEditor />
    </div>
  )
}

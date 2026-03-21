import React from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { NoteList } from "@/components/dashboard/NoteList"
import { CommandPalette } from "@/components/command-palette"
import { DashboardSync } from "@/components/dashboard/DashboardSync"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background/30 backdrop-blur-sm">
      <DashboardSync />
      <Sidebar />
      <NoteList />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <CommandPalette />
        {/* Animated Background for Dashboard is now handled at root level */}
        {children}
      </main>
    </div>
  )
}

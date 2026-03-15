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
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSync />
      <Sidebar />
      <NoteList />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <CommandPalette />
        {/* Animated Background for Dashboard */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        <div className="absolute inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
        {children}
      </main>
    </div>
  )
}

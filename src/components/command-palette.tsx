"use client"

import * as React from "react"
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Search,
  Plus,
  FileText,
  Brain,
  Sparkles,
  Command as CommandIcon,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="bg-background/80 backdrop-blur-3xl border-b border-white/5 p-4 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <CommandInput placeholder="Search ideas, actions, or neural workflows..." className="border-none focus:ring-0 text-lg font-medium" />
        </div>
        <CommandList className="glass border-t border-white/5 max-h-[450px]">
          <CommandEmpty className="p-10 text-center opacity-20 italic">No neural paths found...</CommandEmpty>
          
          <CommandGroup heading={<span className="text-[10px] font-black tracking-widest uppercase opacity-30 px-2 py-4">Active Intelligence</span>}>
            <PaletteItem icon={Plus} label="New Capture" shortcut="⌘N" />
            <PaletteItem icon={Brain} label="Ask Neural Engine" shortcut="⌘J" />
            <PaletteItem icon={Sparkles} label="Summarize Workspace" />
          </CommandGroup>

          <CommandSeparator className="bg-white/5 mx-4" />

          <CommandGroup heading={<span className="text-[10px] font-black tracking-widest uppercase opacity-30 px-2 py-4">Neural Workflows</span>}>
            <PaletteItem icon={FileText} label="Convert to Blog" />
            <PaletteItem icon={Smile} label="Convert to Tweet" />
            <PaletteItem icon={Brain} label="Generate Flashcards" />
            <PaletteItem icon={Calendar} label="Meeting Minutes" />
          </CommandGroup>

          <CommandSeparator className="bg-white/5 mx-4" />

          <CommandGroup heading={<span className="text-[10px] font-black tracking-widest uppercase opacity-30 px-2 py-4">Workspace Navigation</span>}>
            <PaletteItem icon={FileText} label="All Thoughts" />
            <PaletteItem icon={User} label="Neural Identity" />
            <PaletteItem icon={Settings} label="System Settings" shortcut="⌘S" />
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

function PaletteItem({ icon: Icon, label, shortcut }: { icon: any, label: string, shortcut?: string }) {
  return (
    <CommandItem className="rounded-2xl mx-3 my-1 p-3 group hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5">
      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
        <Icon className="h-4 w-4 opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all" />
      </div>
      <span className="font-bold text-sm text-white/60 group-hover:text-white transition-colors uppercase tracking-widest">{label}</span>
      {shortcut && (
        <CommandShortcut className="text-[10px] font-mono border border-white/10 px-2 py-1 rounded-lg opacity-20 group-hover:opacity-60 transition-opacity">
          {shortcut}
        </CommandShortcut>
      )}
    </CommandItem>
  )
}

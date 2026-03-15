"use client"

import React from "react"
import { motion } from "framer-motion"
import { 
  FileText, 
  Star, 
  Archive, 
  Trash2, 
  Folder, 
  Plus, 
  Search, 
  Settings,
  ChevronRight,
  Sparkles,
  Zap,
  Activity,
  Cpu
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useNoteStore } from "@/lib/store"

const navItems = [
  { icon: Activity, label: "Stream", count: 12 },
  { icon: Star, label: "Favorites", count: 3 },
  { icon: Archive, label: "Archives", count: 8 },
  { icon: Trash2, label: "Void", count: 2 },
]

export function Sidebar() {
  const { 
    folders, 
    activeFolderId, 
    setActiveFolder, 
    activeTag, 
    setActiveTag 
  } = useNoteStore()

  return (
    <div className="flex flex-col h-full glass-premium border-r border-white/5 w-80 z-40 bg-black/40 backdrop-blur-[60px]">
      {/* Sidebar Header */}
      <div className="p-10 pb-8 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 group cursor-pointer"
          onClick={() => { setActiveFolder(null); setActiveTag(null); }}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-nebula-purple to-nebula-blue flex items-center justify-center shadow-2xl shadow-purple-500/20 group-hover:scale-110 transition-all duration-700 group-hover:rotate-6">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="flex flex-col -gap-1">
            <span className="font-black tracking-tighter text-2xl text-white italic leading-none">LUMINA</span>
            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-nebula-purple">Nexus v2.0</span>
          </div>
        </div>
      </div>

      <div className="px-6 mb-10">
        <Button variant="secondary" className="w-full h-14 justify-start gap-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-3xl text-xs font-black uppercase tracking-widest text-white/40 group transition-all duration-500 hover:border-white/20">
          <Search className="w-4 h-4 text-nebula-cyan group-hover:scale-110 transition-transform" />
          Neural Search
          <span className="ml-auto text-[10px] bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 font-mono tracking-widest text-white/60 group-hover:text-white transition-colors">
            ⌘K
          </span>
        </Button>
      </div>

      <ScrollArea className="flex-1 px-6">
        <div className="space-y-12 pb-10">
          {/* Main Navigation */}
          <div>
            <div className="flex items-center justify-between mb-6 px-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Intelligence</span>
            </div>
            <div className="space-y-3">
              {navItems.map((item) => (
                <NavItem 
                  key={item.label} 
                  icon={item.icon} 
                  label={item.label} 
                  count={item.count}
                  active={!activeFolderId && !activeTag && (item.label === 'Stream' || item.label === 'All Notes')}
                  onClick={() => { setActiveFolder(null); setActiveTag(null); }}
                />
              ))}
            </div>
          </div>

          {/* Folders Section */}
          <div>
            <div className="flex items-center justify-between mb-6 px-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Neural Map</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-20 hover:opacity-100 hover:bg-white/5 transition-all">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {folders.map(folder => (
                <NavItem 
                  key={folder.id} 
                  icon={Cpu} 
                  label={folder.name} 
                  active={activeFolderId === folder.id}
                  onClick={() => setActiveFolder(folder.id)}
                />
              ))}
              {folders.length === 0 && (
                <div className="px-4 py-8 border border-dashed border-white/5 rounded-[2rem] text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/10">Zero Sectors</p>
                </div>
              )}
            </div>
          </div>

          {/* Tags Section */}
          <div>
            <div className="flex items-center justify-between mb-6 px-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Patterns</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-20 hover:opacity-100 hover:bg-white/5 transition-all">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-3 px-4">
              {['AI', 'DESIGN', 'SYSTEMS'].map(tag => (
                <TagBadge 
                  key={tag} 
                  label={tag} 
                  color={tag === 'AI' ? 'cyan' : tag === 'DESIGN' ? 'purple' : 'blue'} 
                  active={activeTag === tag}
                  onClick={() => setActiveTag(tag)}
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Sidebar Footer */}
      <div className="p-6 mt-auto">
        <div className="p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex items-center gap-5 hover:bg-white/[0.08] transition-all duration-500 cursor-pointer group hover:border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-nebula-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Avatar className="h-12 w-12 border-2 border-white/5 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-6">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback className="bg-nebula-purple text-white font-black">AI</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden relative">
            <div className="text-sm font-black truncate text-white uppercase italic tracking-tighter">Navigator Alpha</div>
            <div className="flex items-center gap-2">
              <Zap className="w-2 h-2 text-nebula-cyan animate-pulse" />
              <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Sovereign Tier</div>
            </div>
          </div>
          <Settings className="w-5 h-5 text-white/10 group-hover:text-white/40 group-hover:rotate-90 transition-all duration-700" />
        </div>
      </div>
    </div>
  )
}

function NavItem({ icon: Icon, label, count, active, onClick }: { icon: any, label: string, count?: number, active?: boolean, onClick?: () => void }) {
  return (
    <Button 
      variant="ghost" 
      onClick={onClick}
      className={cn(
        "w-full justify-start gap-5 h-14 px-6 rounded-[2rem] transition-all duration-500 group relative overflow-hidden border border-transparent",
        active 
          ? "bg-white/10 text-white border-white/10 shadow-2xl" 
          : "text-white/40 hover:text-white hover:bg-white/[0.02]"
      )}
    >
      {active && (
        <motion.div 
          layoutId="sidebar-active-glow"
          className="absolute inset-0 bg-gradient-to-r from-nebula-purple/20 to-transparent pointer-events-none" 
        />
      )}
      <Icon className={cn(
        "w-5 h-5 transition-all duration-500", 
        active ? "text-nebula-purple scale-110 drop-shadow-[0_0_10px_var(--nebula-purple)]" : "opacity-30 group-hover:opacity-100 group-hover:scale-110"
      )} />
      <span className="text-[11px] font-black uppercase tracking-[0.2em] flex-1 text-left italic transition-all duration-500">
        {label}
      </span>
      {count !== undefined && (
        <span className={cn(
          "text-[10px] font-black px-2.5 py-1 rounded-full bg-white/5 border border-white/5 transition-all",
          active ? "opacity-100 text-white border-white/10" : "opacity-20 group-hover:opacity-60"
        )}>
          {count}
        </span>
      )}
    </Button>
  )
}

function TagBadge({ label, color, active, onClick }: { label: string, color: string, active?: boolean, onClick?: () => void }) {
  const colors: Record<string, string> = {
    cyan: "text-nebula-cyan border-nebula-cyan/20 bg-nebula-cyan/5",
    purple: "text-nebula-purple border-nebula-purple/20 bg-nebula-purple/5",
    blue: "text-nebula-blue border-nebula-blue/20 bg-nebula-blue/5",
  }
  
  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "px-5 py-2.5 rounded-2xl border text-[9px] font-black uppercase tracking-[0.2em] cursor-pointer transition-all duration-500", 
        colors[color],
        active && "bg-white/20 border-white/40 text-white shadow-xl ring-4 ring-white/5"
      )}
    >
      {label}
    </motion.div>
  )
}

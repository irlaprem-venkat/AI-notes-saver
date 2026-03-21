"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Trash2, Zap, Sparkles, SlidersHorizontal, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNoteStore, type Note } from "@/lib/store"
import { cn } from "@/lib/utils"
import { createNote } from "@/app/actions/notes"
import { smartSearchExpansion } from "@/app/actions/ai"
import { toast } from "sonner"

export function NoteList() {
  const { 
    notes, 
    currentNote, 
    setCurrentNote, 
    addNote,
    searchQuery,
    setSearchQuery,
    activeFolderId,
    activeTag,
    selectedNoteIds,
    toggleNoteSelection,
    clearSelection,
    deleteNote
  } = useNoteStore()
  
  const [expandedKeywords, setExpandedKeywords] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const filteredNotes = notes.filter(note => {
    const noteContent = (note.title + " " + (note.content || "")).toLowerCase()
    const matchesSearch = noteContent.includes(searchQuery.toLowerCase()) || 
                          expandedKeywords.some(keyword => noteContent.includes(keyword))
    const matchesFolder = !activeFolderId || note.folder_id === activeFolderId
    const matchesTag = !activeTag || (note.tags && note.tags.includes(activeTag))
    return matchesSearch && matchesFolder && matchesTag
  })

  useEffect(() => {
    if (searchQuery.length > 3) {
      const timer = setTimeout(async () => {
        try {
          const keywords = await smartSearchExpansion(searchQuery)
          setExpandedKeywords(keywords || [])
        } catch (error) {
          console.error("Failed to expand search keywords:", error)
          setExpandedKeywords([])
        }
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setExpandedKeywords([])
    }
  }, [searchQuery])

  const isValidUUID = (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  const handleCreateNote = async () => {
    setIsCreating(true)
    try {
      // Only pass folder_id if it's a real UUID — guards against stale store data
      const folderId = activeFolderId && isValidUUID(activeFolderId)
        ? activeFolderId
        : undefined

      const newNoteData = await createNote({
        title: "New Thought",
        content: "",
        folder_id: folderId,
        type: "text"
      })
      
      const formattedNote: Note = {
        ...newNoteData,
        last_modified: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tags: []
      }
      
      addNote(formattedNote)
      setCurrentNote(formattedNote)
      toast.success("Mind captured")
    } catch (error) {
      console.error("Failed to create note:", error)
      toast.error("Neural link failed")
    } finally {
      setIsCreating(false)
    }
  }

  const handleBulkDelete = () => {
    selectedNoteIds.forEach(id => deleteNote(id))
    clearSelection()
  }

  return (
    <div className="w-[400px] border-r border-white/5 flex flex-col h-full bg-black/20 backdrop-blur-[40px]">
      <div className="p-10 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black tracking-tighter text-white italic uppercase">Ideas</h2>
            <div className="flex items-center gap-2 mt-1">
              <Sparkles className="w-3 h-3 text-nebula-purple" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Active Neural Net</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={isCreating}
            onClick={handleCreateNote}
            className="h-14 w-14 rounded-[1.5rem] bg-gradient-to-br from-nebula-purple to-nebula-blue hover:scale-110 active:scale-95 text-white shadow-2xl shadow-purple-500/30 group transition-all duration-500"
          >
            <Plus className={cn("w-7 h-7 transition-all duration-700", isCreating ? "animate-spin" : "group-hover:rotate-180")} />
          </Button>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-nebula-cyan transition-colors" />
          <Input 
            placeholder="Search Intelligence..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-14 bg-white/5 border-white/5 rounded-[1.5rem] h-14 text-sm font-bold tracking-tight focus-visible:ring-nebula-cyan/20 hover:bg-white/10 transition-all border-none shadow-inner"
          />
          <SlidersHorizontal className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
        </div>

        <AnimatePresence>
          {selectedNoteIds.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0, scale: 0.9 }}
              animate={{ height: 'auto', opacity: 1, scale: 1 }}
              exit={{ height: 0, opacity: 0, scale: 0.9 }}
              className="flex items-center justify-between p-5 bg-nebula-purple/10 border border-nebula-purple/20 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-4 h-4 text-nebula-purple animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-nebula-purple">
                  {selectedNoteIds.length} Linked
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-red-500/20 text-red-500" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-white/5" onClick={clearSelection}>
                  <Plus className="w-4 h-4 rotate-45 opacity-40" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ScrollArea className="flex-1 px-6">
        <div className="space-y-4 pb-20 px-2">
          <AnimatePresence mode="popLayout">
            {filteredNotes.length === 0 ? (
              <motion.div 
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32 space-y-4"
              >
                <Brain className="w-12 h-12 text-white/5 mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 italic">Neural void detected</p>
              </motion.div>
            ) : (
              filteredNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.03,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  layout
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey) {
                    toggleNoteSelection(note.id)
                  } else {
                    setCurrentNote(note)
                  }
                }}
                className={cn(
                  "p-8 rounded-[2.5rem] cursor-pointer transition-all duration-700 border relative overflow-hidden group",
                  currentNote?.id === note.id 
                    ? "bg-white/10 border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]" 
                    : "bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/[0.05]",
                  selectedNoteIds.includes(note.id) && "ring-2 ring-nebula-purple ring-offset-4 ring-offset-[#050505]"
                )}
              >
                  {currentNote?.id === note.id && (
                    <motion.div 
                      layoutId="note-card-glow"
                      className="absolute inset-0 bg-gradient-to-br from-nebula-purple/5 to-transparent pointer-events-none"
                    />
                  )}
                  
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <h3 className={cn(
                      "text-md font-black tracking-tight transition-all duration-500 italic uppercase",
                      currentNote?.id === note.id ? "text-white scale-105" : "text-white/40 group-hover:text-white/60"
                    )}>
                      {note.title}
                    </h3>
                    <span className="text-[9px] opacity-20 font-black uppercase tracking-widest">{note.last_modified}</span>
                  </div>
                  
                  <p className={cn(
                    "text-[13px] line-clamp-2 leading-relaxed font-bold tracking-tight transition-all duration-500",
                    currentNote?.id === note.id ? "text-white/60" : "text-white/20 group-hover:text-white/30"
                  )}>
                    {note.content || "Ready for transcription..."}
                  </p>
                  
                  <div className="flex gap-2 mt-6 overflow-hidden relative z-10">
                    {note.tags?.map(tag => (
                      <div 
                        key={tag} 
                        className="bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full text-white/40 group-hover:text-white/60 transition-colors"
                      >
                        {tag}
                      </div>
                    ))}
                    {(!note.tags || note.tags.length === 0) && (
                       <div className="h-6 w-12 rounded-full bg-white/[0.02] border border-transparent" />
                    )}
                  </div>

                  {currentNote?.id === note.id && (
                    <motion.div 
                      layoutId="note-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-nebula-purple rounded-r-full shadow-[0_0_20px_var(--nebula-purple)]"
                    />
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  )
}


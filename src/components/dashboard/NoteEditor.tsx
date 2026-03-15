"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Sparkles, Share2, MoreHorizontal, Star, Clock, Maximize2,
  Brain, CheckCircle2, ChevronDown, Layout, Plus, FileText,
  Image as ImageIcon, Mic, Link, Zap, History, Send, X,
  Lightbulb, ListChecks, Quote, ChevronRight, RotateCcw
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { useNoteStore } from "@/lib/store"
import { summarizeNote, askNoteQuestion, transformNoteAction, type NoteSummary, type TransformFormat } from "@/app/actions/ai"
import { useSpeechToText } from "@/hooks/use-speech-to-text"
import { updateNoteAction } from "@/app/actions/notes"
import { useDebounce } from "../../hooks/use-debounce"

type AITab = 'summary' | 'qa' | 'transform'

interface QAMessage {
  role: 'user' | 'ai'
  content: string
}

export function NoteEditor() {
  const { currentNote, updateNote } = useNoteStore()
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [activeTab, setActiveTab] = useState<AITab>('summary')

  // Summary state
  const [summary, setSummary] = useState<NoteSummary | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)

  // Q&A state
  const [qaMessages, setQaMessages] = useState<QAMessage[]>([])
  const [qaInput, setQaInput] = useState('')
  const [isAsking, setIsAsking] = useState(false)
  const qaEndRef = useRef<HTMLDivElement>(null)

  // Transform state
  const [transformResult, setTransformResult] = useState<{ title: string; content: string } | null>(null)
  const [isTransforming, setIsTransforming] = useState(false)
  const [activeTransform, setActiveTransform] = useState<TransformFormat | null>(null)

  // Editor state
  const [isSaving, setIsSaving] = useState(false)
  const { isListening, transcript, startListening, stopListening } = useSpeechToText()

  // Auto-scroll Q&A
  useEffect(() => {
    qaEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [qaMessages])

  // Append speech transcript to content
  useEffect(() => {
    if (transcript && currentNote) {
      updateNote(currentNote.id, { content: (currentNote.content || '') + ' ' + transcript })
    }
  }, [transcript])

  // Reset AI state when note changes
  useEffect(() => {
    setSummary(null)
    setQaMessages([])
    setTransformResult(null)
  }, [currentNote?.id])

  const handleContentChange = (content: string) => {
    if (!currentNote) return
    updateNote(currentNote.id, { content, last_modified: "Syncing..." })
  }

  const handleTitleChange = (title: string) => {
    if (!currentNote) return
    updateNote(currentNote.id, { title })
  }

  // Debounced autosave
  const debouncedContent = useDebounce(currentNote?.content, 1000)
  const debouncedTitle = useDebounce(currentNote?.title, 1000)

  useEffect(() => {
    const saveNote = async () => {
      if (!currentNote || isSaving) return
      setIsSaving(true)
      try {
        await updateNoteAction(currentNote.id, { title: currentNote.title, content: currentNote.content })
        updateNote(currentNote.id, { last_modified: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
      } catch {
        toast.error("Neural link interrupted")
      } finally {
        setIsSaving(false)
      }
    }
    if (debouncedContent !== undefined || debouncedTitle !== undefined) saveNote()
  }, [debouncedContent, debouncedTitle])

  // ─── AI Handlers ────────────────────────────────────────────────────────────

  const handleSummarize = async () => {
    if (!currentNote?.content?.trim()) { toast.error("Add some content first!"); return }
    setIsSummarizing(true)
    setSummary(null)
    try {
      const res = await summarizeNote(currentNote.content)
      setSummary(res)
      toast.success("Intelligence distilled ✦")
    } catch {
      toast.error("Summarization failed")
    } finally {
      setIsSummarizing(false)
    }
  }

  const handleAskQuestion = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!qaInput.trim() || !currentNote?.content?.trim()) return
    const question = qaInput.trim()
    setQaInput('')
    setQaMessages(prev => [...prev, { role: 'user', content: question }])
    setIsAsking(true)
    try {
      const answer = await askNoteQuestion(currentNote.content, question)
      setQaMessages(prev => [...prev, { role: 'ai', content: answer }])
    } catch {
      toast.error("Q&A failed — try again")
      setQaMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error. Please try again." }])
    } finally {
      setIsAsking(false)
    }
  }

  const handleTransform = async (format: TransformFormat) => {
    if (!currentNote?.content?.trim()) { toast.error("Add some content first!"); return }
    setIsTransforming(true)
    setActiveTransform(format)
    setTransformResult(null)
    try {
      const result = await transformNoteAction(currentNote.content, format)
      const titles: Record<TransformFormat, string> = {
        blog: '📝 Blog Post',
        tweet: '𝕏 Tweet Thread',
        flashcards: '🃏 Flashcards',
        meeting_minutes: '📋 Meeting Minutes'
      }
      setTransformResult({ title: titles[format], content: result })
      toast.success("Content transformed ✦")
    } catch {
      toast.error("Transformation failed")
    } finally {
      setIsTransforming(false)
    }
  }

  // ─── Empty State ─────────────────────────────────────────────────────────────

  if (!currentNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-20 text-center relative overflow-hidden bg-black/40">
        <div className="absolute inset-0 mesh-gradient opacity-10 pointer-events-none" />
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0], boxShadow: ["0 0 20px rgba(0,0,0,0)", "0 0 50px rgba(168,85,247,0.3)", "0 0 20px rgba(0,0,0,0)"] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="w-32 h-32 rounded-[3.5rem] bg-white/[0.03] flex items-center justify-center border border-white/10 relative z-10"
        >
          <Sparkles className="w-14 h-14 text-nebula-purple opacity-40" />
        </motion.div>
        <div className="space-y-4 mt-12 relative z-10">
          <h2 className="text-5xl font-black tracking-tighter italic uppercase text-white">Neural Void</h2>
          <p className="text-sm opacity-20 max-w-sm font-black uppercase tracking-[0.3em] leading-relaxed mx-auto">
            Select a note or create a new one to begin.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] relative selection:bg-nebula-purple/30 selection:text-white">
      <div className="absolute inset-0 mesh-gradient opacity-10 pointer-events-none" />

      {/* Header */}
      <header className="h-24 flex items-center justify-between px-12 glass-premium sticky top-0 z-20 border-b border-white/[0.03]">
        <div className="flex items-center gap-8 flex-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black tracking-[0.4em] text-nebula-purple uppercase italic">Protocol active</span>
              <div className="w-1.5 h-1.5 rounded-full bg-nebula-cyan animate-pulse shadow-[0_0_10px_var(--nebula-cyan)]" />
            </div>
            <div className="text-[9px] font-black opacity-20 uppercase tracking-[0.2em] mt-2 flex items-center gap-3">
              {isSaving ? (
                <span className="flex items-center gap-2 text-nebula-cyan"><ActivityIcon className="w-3 h-3" /> Syncing...</span>
              ) : (
                <span className="flex items-center gap-2"><History className="w-3 h-3" /> Last saved: {currentNote.last_modified}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost" size="sm"
              className={cn("h-12 rounded-[1.5rem] px-8 transition-all duration-700 border", showAIPanel
                ? "bg-gradient-to-r from-nebula-purple/20 to-nebula-blue/20 text-white border-nebula-purple/30 shadow-2xl shadow-nebula-purple/20"
                : "bg-white/[0.03] text-white/40 border-white/5 hover:border-white/20 hover:text-white"
              )}
              onClick={() => setShowAIPanel(!showAIPanel)}
            >
              <Brain className={cn("w-4 h-4 mr-3 transition-colors", showAIPanel ? "text-nebula-purple" : "text-white/20")} />
              <span className="font-black text-[10px] uppercase tracking-widest">AI Summarizer</span>
              {showAIPanel && <span className="ml-2 w-2 h-2 rounded-full bg-nebula-cyan animate-pulse" />}
            </Button>
          </motion.div>
          <Separator orientation="vertical" className="h-8 bg-white/10" />
          <div className="flex items-center gap-3">
            <HeaderAction icon={Star} />
            <HeaderAction icon={Share2} />
            <HeaderAction icon={MoreHorizontal} />
          </div>
        </div>
      </header>

      {/* Editor + AI Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Text Editor */}
        <div className="flex-1 overflow-y-auto pt-24 pb-48 px-12 md:px-24 lg:px-48 scrollbar-hide">
          <div className="max-w-4xl mx-auto space-y-16">
            <motion.input
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              value={currentNote.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full bg-transparent border-none text-8xl font-black tracking-tighter focus:outline-none placeholder:opacity-5 text-white uppercase italic"
              placeholder="CRYSTALLIZE IDEA..."
            />

            <Separator className="bg-white/5 h-[1px]" />

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 1 }} className="min-h-[600px]">
              <Textarea
                value={currentNote.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Where does the logic flow?"
                className="w-full min-h-[600px] bg-transparent border-none focus-visible:ring-0 p-0 text-2xl md:text-3xl font-bold tracking-tight resize-none leading-[1.7] placeholder:opacity-[0.03] text-white/50"
              />
            </motion.div>
          </div>
        </div>

        {/* AI Summarizer Panel */}
        <AnimatePresence>
          {showAIPanel && (
            <motion.aside
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="w-[480px] border-l border-white/5 glass-premium flex flex-col backdrop-blur-[100px] z-30 shadow-[-80px_0_120px_-40px_rgba(0,0,0,0.8)]"
            >
              {/* Panel Header */}
              <div className="p-8 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-nebula-purple to-nebula-blue flex items-center justify-center shadow-2xl shadow-purple-500/30">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-base uppercase italic tracking-tighter text-white">AI Summarizer</h3>
                    <p className="text-[9px] text-nebula-cyan font-black uppercase tracking-[0.4em]">Lumina Neural v2</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowAIPanel(false)}
                  className="rounded-full hover:bg-white/5 h-10 w-10 border border-transparent hover:border-white/10">
                  <X className="w-4 h-4 opacity-40" />
                </Button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-3 border-b border-white/5 shrink-0 bg-black/20">
                {([['summary', 'Summarize', Sparkles], ['qa', 'Ask AI', Send], ['transform', 'Transform', Zap]] as const).map(([id, label, Icon]) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                      activeTab === id
                        ? "bg-white/10 text-white border border-white/10 shadow-xl"
                        : "text-white/30 hover:text-white/60 hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <ScrollArea className="flex-1 min-h-0">
                <div className="p-8 space-y-6">

                  {/* ── SUMMARY TAB ── */}
                  {activeTab === 'summary' && (
                    <div className="space-y-6">
                      <Button
                        onClick={handleSummarize}
                        disabled={isSummarizing}
                        className="w-full h-14 rounded-2xl bg-gradient-to-r from-nebula-purple to-nebula-blue hover:opacity-90 font-black text-[11px] uppercase tracking-widest text-white shadow-2xl shadow-purple-500/30 transition-all duration-500 group border-0"
                      >
                        {isSummarizing ? (
                          <><ActivityIcon className="w-4 h-4 mr-3 animate-spin" />Analysing Neural Patterns...</>
                        ) : (
                          <><Sparkles className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform" />Distill Intelligence</>
                        )}
                      </Button>

                      <AnimatePresence mode="wait">
                        {isSummarizing && (
                          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            {[80, 60, 90, 70, 50].map((w, i) => (
                              <div key={i} className="h-4 rounded-full bg-white/5 animate-pulse" style={{ width: `${w}%`, animationDelay: `${i * 100}ms` }} />
                            ))}
                          </motion.div>
                        )}

                        {!isSummarizing && summary && (
                          <motion.div key="summary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

                            {/* Short Summary */}
                            <div className="p-6 rounded-3xl bg-gradient-to-br from-nebula-purple/10 to-transparent border border-nebula-purple/20 relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-nebula-purple/5 to-transparent" />
                              <div className="text-[9px] font-black uppercase tracking-[0.4em] text-nebula-purple mb-3 flex items-center gap-2 relative z-10">
                                <Sparkles className="w-3 h-3" /> Core Intelligence
                              </div>
                              <p className="text-sm font-bold text-white/80 leading-relaxed relative z-10">{summary.short_summary}</p>
                            </div>

                            {/* Bullet Points */}
                            {summary.bullet_points.length > 0 && (
                              <SummarySection icon={ListChecks} title="Key Points" color="blue">
                                <ul className="space-y-3">
                                  {summary.bullet_points.map((p, i) => (
                                    <li key={i} className="flex items-start gap-3 text-[13px] text-white/60 font-bold leading-relaxed">
                                      <ChevronRight className="w-3 h-3 text-nebula-blue shrink-0 mt-1" />
                                      {p}
                                    </li>
                                  ))}
                                </ul>
                              </SummarySection>
                            )}

                            {/* Key Insights */}
                            {summary.key_insights.length > 0 && (
                              <SummarySection icon={Lightbulb} title="Key Insights" color="cyan">
                                <ul className="space-y-3">
                                  {summary.key_insights.map((insight, i) => (
                                    <li key={i} className="flex items-start gap-3 text-[13px] text-white/60 font-bold leading-relaxed">
                                      <Zap className="w-3 h-3 text-nebula-cyan shrink-0 mt-1" />
                                      {insight}
                                    </li>
                                  ))}
                                </ul>
                              </SummarySection>
                            )}

                            {/* Action Items */}
                            {summary.action_items.length > 0 && (
                              <SummarySection icon={CheckCircle2} title="Action Items" color="purple">
                                <ul className="space-y-3">
                                  {summary.action_items.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-[13px] text-white/60 font-bold leading-relaxed">
                                      <CheckCircle2 className="w-3 h-3 text-nebula-purple shrink-0 mt-1" />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </SummarySection>
                            )}

                            {/* Important Quotes */}
                            {summary.important_quotes.length > 0 && (
                              <SummarySection icon={Quote} title="Key Phrases" color="blue">
                                <ul className="space-y-3">
                                  {summary.important_quotes.map((q, i) => (
                                    <li key={i} className="text-[13px] text-white/60 font-bold italic pl-3 border-l-2 border-nebula-blue/40 leading-relaxed">
                                      "{q}"
                                    </li>
                                  ))}
                                </ul>
                              </SummarySection>
                            )}

                            <Button onClick={handleSummarize} variant="ghost" size="sm" className="w-full text-white/20 hover:text-white/50 text-[10px] font-black uppercase tracking-widest">
                              <RotateCcw className="w-3 h-3 mr-2" /> Re-analyze
                            </Button>
                          </motion.div>
                        )}

                        {!isSummarizing && !summary && (
                          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-20 text-center gap-4 opacity-20">
                            <Brain className="w-10 h-10" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] leading-relaxed">Click Distill to extract intelligence from your note</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* ── Q&A TAB ── */}
                  {activeTab === 'qa' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-nebula-purple/5 border border-nebula-purple/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 leading-relaxed">
                          Ask anything about your note. Lumina AI will answer based on the content.
                        </p>
                      </div>

                      {/* Messages */}
                      <div className="space-y-4 min-h-[200px]">
                        {qaMessages.length === 0 && (
                          <div className="flex flex-col items-center py-12 opacity-20 gap-3">
                            <Send className="w-8 h-8" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No conversation yet</p>
                          </div>
                        )}
                        <AnimatePresence initial={false}>
                          {qaMessages.map((msg, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}
                            >
                              <div className={cn(
                                "max-w-[85%] px-5 py-4 rounded-3xl text-[13px] font-bold leading-relaxed",
                                msg.role === 'user'
                                  ? "bg-gradient-to-br from-nebula-purple to-nebula-blue text-white rounded-br-md shadow-xl shadow-purple-500/20"
                                  : "bg-white/5 border border-white/5 text-white/70 rounded-bl-md"
                              )}>
                                {msg.role === 'ai' && (
                                  <div className="text-[9px] font-black uppercase tracking-widest text-nebula-cyan mb-2">Lumina AI</div>
                                )}
                                {msg.content}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        {isAsking && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="px-5 py-4 rounded-3xl bg-white/5 border border-white/5 flex items-center gap-2">
                              <div className="flex gap-1">
                                {[0, 1, 2].map(i => (
                                  <div key={i} className="w-2 h-2 rounded-full bg-nebula-cyan/60 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                        <div ref={qaEndRef} />
                      </div>

                      {/* Input */}
                      <form onSubmit={handleAskQuestion} className="flex gap-3 sticky bottom-0 pt-4">
                        <Input
                          value={qaInput}
                          onChange={(e) => setQaInput(e.target.value)}
                          placeholder="Ask about this note..."
                          className="flex-1 bg-white/5 border-white/10 rounded-2xl h-12 text-sm font-bold focus-visible:ring-nebula-purple/30 placeholder:text-white/20"
                          disabled={isAsking}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAskQuestion()}
                        />
                        <Button
                          type="submit"
                          disabled={isAsking || !qaInput.trim()}
                          className="h-12 w-12 rounded-2xl bg-gradient-to-br from-nebula-purple to-nebula-blue border-0 shadow-xl shadow-purple-500/20 shrink-0"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* ── TRANSFORM TAB ── */}
                  {activeTab === 'transform' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-3">
                        {([
                          ['blog', 'Blog Post', FileText, 'purple'],
                          ['tweet', 'Tweet Thread', Zap, 'cyan'],
                          ['flashcards', 'Flashcards', Layout, 'blue'],
                          ['meeting_minutes', 'Meeting Notes', Clock, 'purple'],
                        ] as const).map(([format, label, Icon, color]) => (
                          <button
                            key={format}
                            onClick={() => handleTransform(format)}
                            disabled={isTransforming}
                            className={cn(
                              "flex flex-col items-center justify-center h-28 rounded-3xl border transition-all duration-500 gap-3 group relative overflow-hidden",
                              activeTransform === format && !isTransforming
                                ? "bg-white/10 border-white/20 shadow-2xl"
                                : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/15 hover:scale-105"
                            )}
                          >
                            <div className={cn(
                              "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                              color === 'purple' && "bg-gradient-to-br from-nebula-purple/10 to-transparent",
                              color === 'cyan' && "bg-gradient-to-br from-nebula-cyan/10 to-transparent",
                              color === 'blue' && "bg-gradient-to-br from-nebula-blue/10 to-transparent",
                            )} />
                            {isTransforming && activeTransform === format ? (
                              <ActivityIcon className={cn("w-5 h-5 animate-spin", color === 'purple' ? "text-nebula-purple" : color === 'cyan' ? "text-nebula-cyan" : "text-nebula-blue")} />
                            ) : (
                              <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110 duration-300", color === 'purple' ? "text-nebula-purple" : color === 'cyan' ? "text-nebula-cyan" : "text-nebula-blue")} />
                            )}
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/80 transition-colors relative z-10">
                              {isTransforming && activeTransform === format ? 'Processing...' : label}
                            </span>
                          </button>
                        ))}
                      </div>

                      <AnimatePresence mode="wait">
                        {transformResult && (
                          <motion.div key={transformResult.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="text-[10px] font-black uppercase tracking-widest text-nebula-purple">{transformResult.title}</div>
                              <Button
                                variant="ghost" size="sm"
                                className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white/60 h-8"
                                onClick={() => {
                                  navigator.clipboard.writeText(transformResult.content)
                                  toast.success("Copied to clipboard!")
                                }}
                              >
                                Copy
                              </Button>
                            </div>
                            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 max-h-80 overflow-y-auto">
                              <pre className="text-[13px] text-white/60 font-bold leading-relaxed whitespace-pre-wrap">{transformResult.content}</pre>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                </div>
              </ScrollArea>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Toolbar */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 h-20 glass-premium rounded-[2.5rem] border-white/10 px-10 flex items-center gap-8 shadow-[0_80px_120px_-30px_rgba(0,0,0,0.9)] z-40"
      >
        <ToolbarButton icon={Plus} label="N" />
        <Separator orientation="vertical" className="h-8 bg-white/10" />
        <ToolbarButton icon={ImageIcon} label="V" />
        <ToolbarButton 
          icon={Mic} 
          onClick={isListening ? stopListening : startListening}
          active={isListening}
          variant="danger"
          label="S"
        />
        <ToolbarButton icon={Link} label="L" />
        <Separator orientation="vertical" className="h-8 bg-white/10" />
        <Button variant="ghost" size="icon" className="h-12 w-12 text-white/20 hover:text-nebula-cyan hover:bg-white/5 rounded-2xl transition-all">
          <Maximize2 className="w-6 h-6" />
        </Button>
      </motion.div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function SummarySection({ icon: Icon, title, color, children }: { icon: any; title: string; color: string; children: React.ReactNode }) {
  const colorMap: Record<string, string> = {
    blue: "text-nebula-blue",
    cyan: "text-nebula-cyan",
    purple: "text-nebula-purple",
  }
  return (
    <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
      <div className={cn("flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.4em]", colorMap[color])}>
        <Icon className="w-3 h-3" />
        {title}
      </div>
      {children}
    </div>
  )
}

function HeaderAction({ icon: Icon }: { icon: any }) {
  return (
    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-white/5 group border border-transparent hover:border-white/10 transition-all duration-500">
      <Icon className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" />
    </Button>
  )
}

function ToolbarButton({ icon: Icon, onClick, active, variant, label }: { icon: any; onClick?: () => void; active?: boolean; variant?: 'danger'; label: string }) {
  return (
    <div className="relative group">
      <Button
        variant="ghost" size="icon" onClick={onClick}
        className={cn(
          "h-12 w-12 rounded-2xl transition-all duration-700 group relative overflow-hidden border",
          active
            ? (variant === 'danger' ? "bg-red-500 border-red-400 text-white shadow-2xl shadow-red-500/50" : "bg-white/10 border-white/20 text-white shadow-2xl")
            : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05] text-white/20 hover:text-white"
        )}
      >
        <Icon className={cn("w-6 h-6 transition-all duration-700", active && "scale-110")} />
      </Button>
      <span className="absolute -top-12 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest text-nebula-purple opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none whitespace-nowrap">{label}</span>
    </div>
  )
}

function ActivityIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}

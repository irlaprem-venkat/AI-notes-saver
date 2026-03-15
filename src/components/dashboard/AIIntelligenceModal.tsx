"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Brain, Zap, Target, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AIIntelligenceModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
  isLoading?: boolean
}

export function AIIntelligenceModal({ isOpen, onClose, title, content, isLoading }: AIIntelligenceModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-4xl max-h-[85vh] glass-darker rounded-[3rem] border-white/10 shadow-[0_64px_128px_-16px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[1.25rem] bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gradient uppercase tracking-tighter">{title}</h2>
                  <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em]">Neural Intelligence Report</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-12 w-12 rounded-full hover:bg-white/5 group">
                <X className="w-6 h-6 opacity-20 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 p-10">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-8">
                  <div className="relative">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="w-24 h-24 rounded-full border-t-2 border-r-2 border-primary"
                    />
                    <Brain className="w-10 h-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black uppercase tracking-widest text-white/80">Synthesizing Notes</div>
                    <div className="text-sm font-bold opacity-20 mt-2 italic">Neural paths are connecting...</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-12">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose prose-invert max-w-none"
                  >
                    <div className="whitespace-pre-wrap text-lg font-bold leading-relaxed text-white/70">
                      {content}
                    </div>
                  </motion.div>

                  {/* High Confidence Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 border-t border-white/5">
                    <MetricCard icon={Zap} label="Signal Grade" value="98%" />
                    <MetricCard icon={Target} label="Precision" value="High" />
                    <MetricCard icon={Brain} label="Inference" value="Deep" />
                  </div>
                </div>
              )}
            </ScrollArea>

            <div className="p-8 border-t border-white/5 bg-white/[0.02] flex justify-end gap-4">
              <Button variant="ghost" onClick={onClose} className="rounded-2xl px-8 font-black uppercase tracking-widest text-[10px] opacity-40 hover:opacity-100">Dismiss</Button>
              <Button className="rounded-2xl px-8 font-black uppercase tracking-widest text-[10px] bg-primary shadow-lg shadow-primary/20">Add to Workspace</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function MetricCard({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 flex items-center gap-5 group hover:bg-white/[0.06] transition-all">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all" />
      </div>
      <div>
        <div className="text-[10px] font-black uppercase tracking-widest opacity-20">{label}</div>
        <div className="text-xl font-black">{value}</div>
      </div>
    </div>
  )
}

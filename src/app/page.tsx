"use client"

import React from "react"
import { motion } from "framer-motion"
import { ArrowRight, Brain, Sparkles, Mic, Image as ImageIcon, Zap, Shield, Globe } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlassBubbleUniverse } from "@/components/3d/GlassBubbleUniverse";

const Navbar = () => (
  <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-8 py-4 glass-premium mx-auto w-[90%] max-w-7xl rounded-full border-white/5 shadow-2xl">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nebula-purple to-nebula-blue flex items-center justify-center shadow-lg shadow-purple-500/20">
        <Sparkles className="w-6 h-6 text-white" />
      </div>
      <span className="text-2xl font-black tracking-tighter uppercase italic text-nebula">Lumina</span>
    </div>
    
    <div className="hidden md:flex items-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
      <Link href="#features" className="hover:text-white transition-colors hover:text-glow">Engine</Link>
      <Link href="#pricing" className="hover:text-white transition-colors hover:text-glow">Network</Link>
      <Link href="#about" className="hover:text-white transition-colors hover:text-glow">Core</Link>
    </div>
    
    <div className="flex items-center gap-4">
      <Link href="/auth">
        <Button variant="ghost" size="sm" className="font-bold text-xs uppercase tracking-widest text-white/60 hover:text-white">Neural Key</Button>
      </Link>
      <Link href="/auth">
        <Button size="sm" className="btn-premium px-8 h-10 text-[10px]">Initialize</Button>
      </Link>
    </div>
  </nav>
)

export default function Home() {
  return (
    <div className="relative min-h-screen text-foreground selection:bg-nebula-purple/30 selection:text-white">
      {/* 3D background is now in root layout */}
      <Navbar />

      <main className="relative pt-48 pb-32 px-6">
        {/* Massive Hero */}
        <section className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass border-white/5 mb-10 group cursor-pointer hover:border-white/20 transition-all">
              <span className="w-2 h-2 rounded-full bg-nebula-cyan animate-pulse shadow-[0_0_10px_var(--nebula-cyan)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Neural Engine 2.0 Live</span>
              <ArrowRight className="w-3 h-3 text-white/20 group-hover:translate-x-1 group-hover:text-white transition-all" />
            </div>
            
            <h1 className="text-7xl md:text-[10rem] font-black leading-[0.8] tracking-tighter mb-12 uppercase italic">
              <span className="block text-white">Capture</span>
              <span className="block text-nebula drop-shadow-[0_10px_30px_rgba(168,85,247,0.4)]">Light</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/40 mb-16 max-w-3xl mx-auto leading-relaxed font-bold tracking-tight">
              A neural second brain that transforms chaotic thoughts into distilled intelligence. 
              Built for the designers of the future.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-32">
              <Link href="/auth">
                <Button size="lg" className="btn-premium h-20 px-12 text-md group shadow-[0_20px_60px_-15px_rgba(168,85,247,0.6)]">
                  Launch Your Mind
                  <Zap className="ml-3 w-6 h-6 fill-white" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-full h-20 px-12 text-md glass border-white/10 hover:bg-white/5 font-black uppercase tracking-widest">
                See Nexus
              </Button>
            </div>
          </motion.div>

          {/* Holographic Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
            className="perspective-2000 relative max-w-6xl mx-auto group"
          >
            <div className="glass-premium p-4 rounded-[4rem] shadow-[0_80px_120px_-30px_rgba(0,0,0,0.8)] border-white/[0.03] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-nebula-purple/10 to-transparent pointer-events-none" />
              <div className="bg-[#050505] rounded-[3rem] overflow-hidden aspect-[21/9] relative">
                {/* Mockup UI Interface */}
                <div className="absolute inset-0 flex">
                  <div className="w-72 border-r border-white/5 bg-black/40 p-10 flex flex-col gap-8">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 animate-pulse" />
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-4 rounded-full bg-white/5 w-full transition-all group-hover:bg-white/10" />
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 p-20 text-left">
                    <motion.div 
                      animate={{ opacity: [0.4, 1, 0.4] }} 
                      transition={{ duration: 3, repeat: Infinity }}
                      className="h-2 w-32 bg-nebula-cyan rounded-full mb-10" 
                    />
                    <div className="h-20 bg-white/5 w-3/4 rounded-3xl mb-12" />
                    <div className="space-y-6">
                      <div className="h-6 bg-white/[0.03] w-full rounded-2xl" />
                      <div className="h-6 bg-white/[0.03] w-full rounded-2xl" />
                      <div className="h-6 bg-white/[0.03] w-4/5 rounded-2xl" />
                    </div>
                  </div>
                </div>
                
                {/* Visual Artifacts */}
                <div className="absolute top-0 right-0 p-10">
                  <div className="w-48 h-48 border border-white/5 rounded-full flex items-center justify-center animate-spin-slow">
                     <div className="w-32 h-32 border border-white/5 rounded-full flex items-center justify-center animate-reverse-spin">
                        <Sparkles className="w-10 h-10 text-nebula-cyan opacity-20" />
                     </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Massive Floor Glow */}
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-4/5 h-40 bg-nebula-purple/30 blur-[120px] -z-10" />
          </motion.div>
        </section>

        {/* Security Protocol Section */}
        <section className="max-w-5xl mx-auto mt-64 mb-32 px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="p-16 rounded-[4rem] glass-premium border-white/10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-nebula-cyan to-transparent opacity-50" />
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-nebula-cyan/5 blur-[100px] rounded-full" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-nebula-purple/5 blur-[100px] rounded-full" />
            
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/5 border border-white/10 mb-10 glass shadow-2xl">
              <Shield className="w-10 h-10 text-nebula-cyan drop-shadow-[0_0_15px_var(--nebula-cyan)]" />
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black uppercase italic mb-8 tracking-tighter">
              World Strongest <span className="text-nebula">Security</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-12 text-left">
              <div className="space-y-4">
                <div className="text-nebula-cyan font-black text-[10px] uppercase tracking-widest">Protocol 01</div>
                <h4 className="text-xl font-bold text-white italic transition-all group-hover:text-nebula-cyan">Neural Encryption</h4>
                <p className="text-white/30 text-xs leading-relaxed font-medium">Your data is fragmented and encrypted with RSA-4096 before hitting the neural core.</p>
              </div>
              <div className="space-y-4">
                <div className="text-nebula-purple font-black text-[10px] uppercase tracking-widest">Protocol 02</div>
                <h4 className="text-xl font-bold text-white italic">Biometric Auth</h4>
                <p className="text-white/30 text-xs leading-relaxed font-medium">Multi-factor authentication via GitHub, Google, and Magic Neural Keys.</p>
              </div>
              <div className="space-y-4">
                <div className="text-nebula-blue font-black text-[10px] uppercase tracking-widest">Protocol 03</div>
                <h4 className="text-xl font-bold text-white italic">Zero Knowledge</h4>
                <p className="text-white/30 text-xs leading-relaxed font-medium">Even we cannot see your thoughts. Privacy is not a feature, it's the core.</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Feature Sectors */}
        <section id="features" className="max-w-7xl mx-auto px-10">
          <div className="text-center mb-32">
             <h2 className="text-5xl md:text-7xl font-black uppercase italic mb-6">Neural Senses</h2>
             <p className="text-white/30 font-bold uppercase tracking-[0.3em] text-[10px]">Advanced Human-App Interface</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureSector
              icon={<Mic className="w-8 h-8 text-nebula-cyan" />}
              title="Sonic Input"
              description="Whisper your thoughts. Optimized for high-fidelity voice-to-logic conversion."
              color="cyan"
            />
            <FeatureSector
              icon={<Shield className="w-8 h-8 text-nebula-purple" />}
              title="Fortress Storage"
              description="World-class security for your digital brain. Protected by Lumina Guard."
              color="purple"
            />
            <FeatureSector
              icon={<Brain className="w-8 h-8 text-nebula-blue" />}
              title="Core Logic"
              description="Semantic mapping of your thoughts. Find relationships you never knew existed."
              color="blue"
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-20 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-nebula-purple" />
              <span className="text-2xl font-black italic uppercase text-white">Lumina</span>
            </div>
            <p className="text-white/20 text-xs font-bold tracking-widest uppercase">The Sovereign of Intelligence</p>
          </div>
          <div className="flex gap-16 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
            <Link href="#" className="hover:text-white transition-colors">Neural</Link>
            <Link href="#" className="hover:text-white transition-colors">Protocol</Link>
            <Link href="#" className="hover:text-white transition-colors">Identity</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureSector({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -10 }}
      className="p-12 rounded-[3.5rem] glass-premium border-white/[0.02] hover:border-white/10 transition-all duration-700 group relative overflow-hidden"
    >
      <div className={`absolute -top-20 -right-20 w-40 h-40 bg-nebula-${color}/10 blur-[60px] rounded-full group-hover:opacity-100 transition-opacity opacity-50`} />
      <div className="w-16 h-16 rounded-[1.5rem] bg-white/[0.03] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 shadow-xl border border-white/[0.05]">
        {icon}
      </div>
      <h3 className="text-3xl font-black uppercase italic mb-4">{title}</h3>
      <p className="text-white/30 leading-relaxed font-bold tracking-tight text-sm">
        {description}
      </p>
    </motion.div>
  )
}

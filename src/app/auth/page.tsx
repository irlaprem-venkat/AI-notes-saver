"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Sparkles, Mail, Lock, Chrome, ArrowRight, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

export default function AuthPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()

  // Show error from callback (e.g. failed email confirmation)
  useEffect(() => {
    const error = searchParams.get("error")
    if (error) toast.error(error)
  }, [searchParams])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success("Success! Redirecting...")
      // Use a hard navigation so the browser sends a fresh request with the
      // newly-set session cookie. router.push fires before the cookie is
      // recognised server-side, causing the middleware to loop back to /auth.
      window.location.href = "/dashboard"
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Signup attempt:", { email })
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    
    if (error) {
      console.error("Signup error:", error)
      toast.error(error.message)
    } else {
      console.log("Signup success:", data)
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast.error("An account with this email already exists.")
      } else {
        toast.success("Registration successful! Please check your email for a confirmation link.")
      }
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) toast.error(error.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-20" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] opacity-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[450px]"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 glass animate-glow">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Lumina AI</h1>
          <p className="text-muted-foreground">Your second brain, powered by light.</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-8 bg-white/5 border border-white/10 rounded-xl p-1">
            <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="glass border-white/10 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                <CardDescription>Enter your email to sign in to your account</CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="m@example.com" 
                        className="pl-10 bg-white/5 border-white/10 h-11"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                      <Input 
                        id="password" 
                        type="password" 
                        className="pl-10 bg-white/5 border-white/10 h-11"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit"
                    className="w-full h-11 rounded-xl text-md font-bold group" 
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : (
                      <>
                        Sign In <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </form>
              <CardFooter className="flex flex-col space-y-4 border-t border-white/5 pt-6 bg-white/3">
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/5" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-transparent px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Button variant="outline" className="glass border-white/10 hover:bg-white/5 transition-colors" onClick={handleGoogleLogin}>
                    <Chrome className="mr-2 h-4 w-4" /> Google
                  </Button>
                  <Button variant="outline" className="glass border-white/10 hover:bg-white/5 transition-colors">
                    <Github className="mr-2 h-4 w-4" /> Github
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="glass border-white/10 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                <CardDescription>Enter your email to get started with Lumina</CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="m@example.com" 
                        className="pl-10 bg-white/5 border-white/10 h-11"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                      <Input 
                        id="signup-password" 
                        type="password" 
                        className="pl-10 bg-white/5 border-white/10 h-11"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit"
                    className="w-full h-11 rounded-xl text-md font-bold group" 
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : (
                      <>
                        Create Account <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs text-muted-foreground mt-8 opacity-40">
          By continuing, you agree to Lumina's Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  )
}

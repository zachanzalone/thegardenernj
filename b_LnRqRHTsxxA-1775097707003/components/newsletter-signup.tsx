"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Check, Loader2 } from "lucide-react"

export function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes("@")) {
      setStatus("error")
      setMessage("Please enter a valid email address")
      return
    }

    setStatus("loading")
    
    // Simulate API call - replace with actual newsletter service integration
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setStatus("success")
    setMessage("You're subscribed! Check your inbox for confirmation.")
    setEmail("")
    
    // Reset after 5 seconds
    setTimeout(() => {
      setStatus("idle")
      setMessage("")
    }, 5000)
  }

  return (
    <div id="newsletter-signup" className="bg-foreground text-background py-8 scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-background/10 flex items-center justify-center">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 
                className="font-display text-xl md:text-2xl font-bold"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Stay in the Loop
              </h3>
              <p className="text-sm text-background/70">
                Receive updates on releases and show schedules
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading" || status === "success"}
                className="h-11 bg-background text-foreground border-0 placeholder:text-muted-foreground"
              />
            </div>
            <Button 
              type="submit" 
              disabled={status === "loading" || status === "success"}
              className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {status === "loading" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {status === "success" && <Check className="h-4 w-4 mr-2" />}
              {status === "success" ? "Subscribed" : "Subscribe"}
            </Button>
          </form>
        </div>
        
        {message && (
          <p className={`mt-3 text-sm text-center md:text-right ${status === "error" ? "text-red-300" : "text-background/70"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

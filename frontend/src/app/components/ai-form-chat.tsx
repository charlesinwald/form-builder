"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { ScrollArea } from "@/app/components/ui/scroll-area"
import { Loader2, Send, Bot, User, Sparkles, Wand2, Zap, MessageCircle } from "lucide-react"
import type { FormGenerationResponse } from "@/lib/ai-service"
import type { FormField } from "../../../../shared/types"

interface Message {
  id: string
  type: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  formData?: FormGenerationResponse
}

interface AIFormChatProps {
  onFormGenerated: (formData: FormGenerationResponse) => void
  currentForm?: FormGenerationResponse
  onFormImproved: (fields: FormField[]) => void
}

export function AIFormChat({ onFormGenerated, currentForm, onFormImproved }: AIFormChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "system",
      content:
        '✨ Welcome! I\'m your AI form creation assistant. I\'ll help you build beautiful, functional forms in seconds.\n\nJust describe what you need:\n• "Create a contact form with name, email, and message"\n• "Build a job application form with file upload"\n• "Make a customer feedback survey with ratings"\n\n💡 **Pro tip:** After I create your form, click "Publish" in the header to make it live for submissions!\n\nWhat amazing form shall we create together?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      if (currentForm) {
        // Improve existing form
        const response = await fetch("/api/ai/improve-form", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentForm,
            feedback: input.trim(),
          }),
        })

        if (!response.ok) throw new Error("Failed to improve form")

        const { fields } = await response.json()

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content:
            "🎉 Perfect! I've enhanced your form based on your feedback. The improvements are now live in your form builder - take a look!\n\nAnything else you'd like me to adjust or add?",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        onFormImproved(fields)
      } else {
        // Generate new form
        const response = await fetch("/api/ai/generate-form", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: input.trim() }),
        })

        if (!response.ok) throw new Error("Failed to generate form")

        const formData: FormGenerationResponse = await response.json()

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: `🚀 Fantastic! I've crafted "${formData.title}" with ${formData.fields.length} thoughtfully designed fields. Your form is ready for customization in the builder!\n\n📋 **Next steps:**\n• Customize field styling and validation\n• Preview your form's appearance\n• Hit \"Publish\" to make it live\n\nWant me to add more fields or make any tweaks?`,
          timestamp: new Date(),
          formData,
        }

        setMessages((prev) => [...prev, assistantMessage])
        onFormGenerated(formData)
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content:
          "🤔 Oops! I hit a small snag while processing that. Could you try rephrasing your request? I'm here to help!",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const quickPrompts = currentForm
    ? [
        "Add a phone number field",
        "Make the email field optional",
        "Add a file upload for documents",
        "Include a terms checkbox",
      ]
    : [
        "Contact form",
        "Job application",
        "Event registration",
        "Customer survey",
        "Newsletter signup",
        "Product feedback",
      ]

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background to-muted/30">
      <Card className="h-full flex flex-col border-0 shadow-xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="pb-4 border-b border-border/50">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-accent-foreground" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-balance">AI Form Assistant</span>
              {currentForm && (
                <span className="text-sm font-normal text-muted-foreground">Enhancing: {currentForm.title}</span>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-6 pt-6">
          <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.type !== "user" && (
                    <div className="flex-shrink-0 mt-1">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${
                          message.type === "system"
                            ? "bg-gradient-to-br from-accent to-secondary"
                            : "bg-gradient-to-br from-primary to-accent"
                        }`}
                      >
                        {message.type === "system" ? (
                          <Sparkles className="w-4 h-4 text-accent-foreground" />
                        ) : (
                          <MessageCircle className="w-4 h-4 text-primary-foreground" />
                        )}
                      </div>
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                      message.type === "user"
                        ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground ml-auto"
                        : message.type === "system"
                          ? "bg-gradient-to-br from-muted to-muted/70 border border-border/50"
                          : "bg-gradient-to-br from-card to-muted/30 border border-border/30"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-pretty">{message.content}</p>
                    {message.formData && (
                      <div className="mt-3 pt-3 border-t border-border/30">
                        <div className="text-xs space-y-2 opacity-90">
                          <div className="flex items-center gap-2">
                            <Zap className="w-3 h-3" />
                            <strong>{message.formData.title}</strong>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-accent/20 flex items-center justify-center text-[10px]">
                              {message.formData.fields.length}
                            </span>
                            <span>fields created</span>
                          </div>
                          <div className="text-[11px] opacity-75 line-clamp-2">
                            {message.formData.fields.map((f) => f.label).join(" • ")}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {message.type === "user" && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shadow-md border border-primary/20">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                      <Bot className="w-4 h-4 text-primary-foreground animate-pulse" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-card to-muted/30 border border-border/30 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {currentForm ? "Enhancing your form..." : "Crafting your form..."}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="space-y-4">
            {quickPrompts.length > 0 && !isLoading && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {currentForm ? "Quick improvements" : "Popular templates"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 rounded-xl border-border/50 hover:bg-accent/10 hover:border-accent/30 hover:text-accent-foreground transition-all duration-200 bg-transparent"
                      onClick={() => handleQuickPrompt(prompt)}
                    >
                      {currentForm ? <Wand2 className="w-3 h-3 mr-1.5" /> : <Sparkles className="w-3 h-3 mr-1.5" />}
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-3">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  currentForm ? "How would you like to improve your form?" : "Describe the form you want to create..."
                }
                disabled={isLoading}
                className="flex-1 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="icon"
                className="rounded-xl bg-gradient-to-br from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

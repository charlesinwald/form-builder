"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Loader2, Send, Bot, User, Sparkles, Wand2 } from "lucide-react";
import { FormGenerationResponse } from "@/lib/ai-service";
import { FormField } from "../../../../shared/types";

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  formData?: FormGenerationResponse;
}

interface AIFormChatProps {
  onFormGenerated: (formData: FormGenerationResponse) => void;
  currentForm?: FormGenerationResponse;
  onFormImproved: (fields: FormField[]) => void;
}

export function AIFormChat({ onFormGenerated, currentForm, onFormImproved }: AIFormChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: "👋 Hi! I'm your AI form assistant. Describe the form you'd like to create and I'll generate it for you. For example:\n\n• \"Create a contact form with name, email, and message\"\n• \"Build a job application form\"\n• \"Make a customer feedback survey\"\n\n📝 **Tip:** After I create your form, remember to click \"Publish\" in the header to make it available for public submissions!\n\nWhat would you like to create?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (currentForm) {
        // Improve existing form
        const response = await fetch('/api/ai/improve-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentForm,
            feedback: input.trim()
          })
        });

        if (!response.ok) throw new Error('Failed to improve form');

        const { fields } = await response.json();
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: "✨ I've improved your form based on your feedback! The updated fields have been applied to your form builder.",
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        onFormImproved(fields);
      } else {
        // Generate new form
        const response = await fetch('/api/ai/generate-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: input.trim() })
        });

        if (!response.ok) throw new Error('Failed to generate form');

        const formData: FormGenerationResponse = await response.json();
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: `🎉 Great! I've created "${formData.title}" for you with ${formData.fields.length} fields. The form has been loaded in your builder where you can customize it further.\n\n📝 **Important:** Your form is currently saved as a draft. To make it available for submissions, you'll need to publish it using the "Publish" button in the header.\n\nWould you like me to add more fields or make any adjustments?`,
          timestamp: new Date(),
          formData
        };

        setMessages(prev => [...prev, assistantMessage]);
        onFormGenerated(formData);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "❌ Sorry, I encountered an error while processing your request. Please try again with a different description.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const quickPrompts = currentForm ? [
    "Add a phone number field",
    "Make the email field optional",
    "Add a file upload for documents",
    "Include a terms and conditions checkbox"
  ] : [
    "Contact form",
    "Job application", 
    "Event registration",
    "Customer survey",
    "Newsletter signup",
    "Product feedback form"
  ];

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="relative">
            <Bot className="w-5 h-5" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-purple-500" />
          </div>
          AI Form Assistant
          {currentForm && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              Improving: {currentForm.title}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4 pt-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-3">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                    {message.type === 'system' ? (
                      <Sparkles className="w-4 h-4 text-purple-600" />
                    ) : (
                      <Bot className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : message.type === 'system'
                      ? 'bg-muted/50 border-2 border-dashed border-muted-foreground/20'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.formData && (
                    <div className="mt-2 pt-2 border-t border-muted-foreground/20">
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>📋 <strong>{message.formData.title}</strong></div>
                        <div>📝 {message.formData.fields.length} fields created</div>
                        <div>🏷️ Fields: {message.formData.fields.map(f => f.label).join(', ')}</div>
                      </div>
                    </div>
                  )}
                </div>

                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-purple-600" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">
                      {currentForm ? 'Improving your form...' : 'Creating your form...'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="space-y-3">
          {quickPrompts.length > 0 && !isLoading && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                {currentForm ? '💡 Quick improvements:' : '⚡ Quick starts:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => handleQuickPrompt(prompt)}
                  >
                    {currentForm ? <Wand2 className="w-3 h-3 mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                currentForm 
                  ? "Describe how you'd like to improve the form..."
                  : "Describe the form you want to create..."
              }
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || isLoading} size="icon">
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
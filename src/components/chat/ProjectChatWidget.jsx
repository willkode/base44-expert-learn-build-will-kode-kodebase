import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatMessageBubble from "./ChatMessageBubble";

export default function ProjectChatWidget({ project }) {
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const scrollRef = useRef(null);
  const unsubRef = useRef(null);

  // Create the conversation the first time the widget is opened.
  useEffect(() => {
    if (!open || conversation || initializing) return;
    setInitializing(true);
    base44.agents
      .createConversation({
        agent_name: "project_assistant",
        metadata: {
          name: `Project chat: ${project.projectName}`,
          description: `Assistant chat for project ${project.id}`,
          projectId: project.id,
        },
      })
      .then((conv) => {
        setConversation(conv);
        setMessages(conv.messages || []);
      })
      .finally(() => setInitializing(false));
  }, [open, conversation, initializing, project]);

  // Subscribe to live updates for the active conversation.
  useEffect(() => {
    if (!conversation?.id) return;
    unsubRef.current = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
      setSending(false);
    });
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, [conversation?.id]);

  // Auto-scroll to the latest message.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !conversation || sending) return;
    setInput("");
    setSending(true);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    await base44.agents.addMessage(conversation, {
      role: "user",
      content: `Context: I'm working on project "${project.projectName}" (id: ${project.id}). ${text}`,
    });
  };

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg glow-orange flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Open project assistant"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Panel */}
      <div
        className={cn(
          "fixed bottom-24 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-96 h-[32rem] max-h-[calc(100vh-8rem)] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden transition-all origin-bottom-right",
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-secondary/50">
          <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-sora font-semibold text-sm leading-tight">Project Assistant</p>
            <p className="text-xs text-muted-foreground truncate">Ask about {project.projectName} & Base44</p>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {initializing ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground mt-8 px-4">
              <Sparkles className="w-7 h-7 text-primary mx-auto mb-3" />
              Hi! Ask me anything about this project's blueprint, prompts, or building it on Base44.
            </div>
          ) : (
            messages.map((m, i) => <ChatMessageBubble key={i} message={m} />)
          )}
          {sending && (
            <div className="flex items-center gap-2 text-muted-foreground text-xs pl-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking...
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Ask about your project..."
            disabled={!conversation || sending}
            className="flex-1"
          />
          <Button size="icon" onClick={handleSend} disabled={!conversation || sending || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
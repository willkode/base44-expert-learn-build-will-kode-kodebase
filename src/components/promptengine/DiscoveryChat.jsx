import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles } from "lucide-react";
import Markdown from "@/components/blueprint/Markdown";
import { trackEvent } from "@/lib/analytics";

export default function DiscoveryChat({ session, messages, onMessages, onSession, onReady }) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");
    // Optimistic user bubble.
    onMessages((prev) => [...prev, { id: `tmp-${Date.now()}`, role: "user", content: text }]);
    try {
      const res = await base44.functions.invoke("promptDiscoveryChat", {
        sessionId: session.id,
        userMessage: text,
      });
      const data = res.data || {};
      trackEvent("prompt_engine_discovery_message", { completion_score: data.completionScore || 0 });
      // Reload full message history + session to stay in sync.
      const [msgs, sessions] = await Promise.all([
        base44.entities.PromptGeneratorMessage.filter({ session_id: session.id }, "order_index"),
        base44.entities.PromptGeneratorSession.filter({ id: session.id }),
      ]);
      onMessages(() => msgs);
      if (sessions[0]) onSession(sessions[0]);
      if (data.readyToCompile) onReady?.();
    } catch (e) {
      onMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: "assistant", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[60vh] min-h-[420px] rounded-xl border border-border bg-card overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            <Sparkles className="w-7 h-7 mx-auto mb-3 text-primary" />
            <p className="text-sm max-w-md mx-auto">
              Describe your app idea in a sentence or two. I'll ask a few smart questions and build a complete blueprint.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm"
                  : "max-w-[90%] rounded-2xl rounded-bl-sm bg-secondary px-4 py-3"
              }
            >
              {m.role === "user" ? <p className="whitespace-pre-wrap">{m.content}</p> : <Markdown content={m.content} />}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-secondary px-4 py-3 flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Thinking through your blueprint…
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-border p-3 bg-background/40">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Describe your app or answer the questions…"
            className="min-h-[44px] max-h-32 resize-none bg-card"
            disabled={sending}
          />
          <Button onClick={send} disabled={sending || !input.trim()} size="icon" className="h-11 w-11 shrink-0">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
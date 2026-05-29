import React, { createContext, useContext, useRef, useState, useCallback } from "react";

const ChatWidgetContext = createContext(null);

export function useChatWidget() {
  return useContext(ChatWidgetContext);
}

export function ChatWidgetProvider({ children }) {
  const [open, setOpen] = useState(false);
  // A pending prompt to push into the chat once it's ready.
  const pendingRef = useRef(null);
  const [pendingVersion, setPendingVersion] = useState(0);

  const openChat = useCallback(() => setOpen(true), []);

  const openChatWith = useCallback((promptText) => {
    pendingRef.current = promptText;
    setPendingVersion((v) => v + 1);
    setOpen(true);
  }, []);

  const consumePending = useCallback(() => {
    const p = pendingRef.current;
    pendingRef.current = null;
    return p;
  }, []);

  return (
    <ChatWidgetContext.Provider value={{ open, setOpen, openChat, openChatWith, consumePending, pendingVersion }}>
      {children}
    </ChatWidgetContext.Provider>
  );
}
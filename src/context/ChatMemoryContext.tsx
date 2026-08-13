import React, { createContext, useContext, useEffect, useState } from "react";

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
}

export interface ChatThread {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: number;
}

interface ChatMemoryContextValue {
  chats: ChatThread[];
  activeChatId: string | null;
  createChat: (name?: string) => string;
  setActiveChat: (id: string) => void;
  renameChat: (id: string, name: string) => void;
  deleteChat: (id: string) => void;
  addMessageToActive: (m: ChatMessage) => void;
  getActiveMessages: () => ChatMessage[];
}

const STORAGE_KEY = "petnestle_chats_v1";

const ChatMemoryContext = createContext<ChatMemoryContextValue | undefined>(undefined);

const initialThread = (): ChatThread => ({
  id: "thread_1",
  name: "New Chat",
  createdAt: Date.now(),
  messages: [
    { id: "1", text: "Hello! I'm the PetNestle AI Assistant powered by Gemini. How can I help you with your pet today?", sender: "bot" },
  ],
});

export const ChatMemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chats, setChats] = useState<ChatThread[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as ChatThread[];
    } catch (e) {
      // ignore
    }
    return [initialThread()];
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY + "_active");
      if (raw) return raw;
    } catch (e) {}
    const first = chats[0];
    return first ? first.id : null;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
      if (activeChatId) localStorage.setItem(STORAGE_KEY + "_active", activeChatId);
    } catch (e) {
      // ignore
    }
  }, [chats, activeChatId]);

  const createChat = (name?: string) => {
    const id = `thread_${Date.now()}`;
    const thread: ChatThread = { id, name: name || "New Chat", messages: [], createdAt: Date.now() };
    setChats((p) => [thread, ...p]);
    setActiveChatId(id);
    return id;
  };

  const setActiveChat = (id: string) => {
    setActiveChatId(id);
  };

  const renameChat = (id: string, name: string) => {
    setChats((p) => p.map((c) => (c.id === id ? { ...c, name } : c)));
  };

  const deleteChat = (id: string) => {
    setChats((p) => {
      const next = p.filter((c) => c.id !== id);
      if (next.length === 0) return [initialThread()];
      return next;
    });
    setActiveChatId((prev) => (prev === id ? (chats[0] ? chats[0].id : null) : prev));
  };

  const addMessageToActive = (m: ChatMessage) => {
    setChats((p) => p.map((c) => (c.id === activeChatId ? { ...c, messages: [...c.messages, m] } : c)));
  };

  const getActiveMessages = () => {
    const thread = chats.find((c) => c.id === activeChatId) || chats[0];
    return thread ? thread.messages : [];
  };

  return (
    <ChatMemoryContext.Provider value={{ chats, activeChatId, createChat, setActiveChat, renameChat, deleteChat, addMessageToActive, getActiveMessages }}>
      {children}
    </ChatMemoryContext.Provider>
  );
};

export const useChatMemory = () => {
  const ctx = useContext(ChatMemoryContext);
  if (!ctx) throw new Error("useChatMemory must be used within ChatMemoryProvider");
  return ctx;
};

export default ChatMemoryContext;

import React, { useRef, useEffect, useState } from "react";
import { Send, Bot, User, Loader2, Sparkles, Activity, Stethoscope, Apple } from "lucide-react";
import Markdown from "react-markdown";
import { useChatMemory } from "../context/ChatMemoryContext";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

export default function Chatbot() {
  const { chats, activeChatId, createChat, setActiveChat, renameChat, deleteChat, addMessageToActive, getActiveMessages } = useChatMemory();
  const messages = getActiveMessages();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState<string | null>(null);
  const [renamingText, setRenamingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent, predefinedText?: string) => {
    e?.preventDefault();
    const textToSend = predefinedText || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text: textToSend, sender: "user" };

    // persist via context (active chat)
    addMessageToActive(userMessage);
    if (!predefinedText) setInput("");
    setIsLoading(true);

    try {
      // Format history for Gemini API
      // We skip the first message (the bot's greeting)
      const rawHistory = messages
        .filter(m => m.id !== "1") // Skip initial greeting
        .map(m => ({
          role: m.sender === "user" ? "user" : "model",
          text: m.text
        }));

      // Add the new user message to history
      rawHistory.push({ role: "user", text: textToSend });

      // Collapse consecutive messages from the same role to prevent 400 errors
      const history: any[] = [];
      let currentRole: string | null = null;
      let currentText = "";

      for (const msg of rawHistory) {
        if (msg.role === currentRole) {
          currentText += "\n\n" + msg.text;
        } else {
          if (currentRole) {
            history.push({ role: currentRole, parts: [{ text: currentText }] });
          }
          currentRole = msg.role;
          currentText = msg.text;
        }
      }
      if (currentRole) {
        history.push({ role: currentRole, parts: [{ text: currentText }] });
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'GENERATION_FAILED');
      }

      const data = await res.json();

      addMessageToActive({ id: (Date.now() + 1).toString(), text: data.text || "Sorry, I couldn't process that.", sender: "bot" });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      
      let errorMessage = "Oops! I'm having trouble connecting to my brain right now. Please try again later.";
      
      if (error.message === "API_KEY_MISSING" || (error.message && error.message.includes("API key"))) {
        errorMessage = "Configuration Error: The Gemini API Key is missing. If you are on Vercel, please make sure you added GEMINI_API_KEY to your Environment Variables and **you must trigger a new deployment** for it to take effect.";
      }
      
      addMessageToActive({ id: (Date.now() + 1).toString(), text: errorMessage, sender: "bot" });
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { icon: <Activity className="w-4 h-4" />, text: "Symptom Checker", prompt: "My pet is showing some symptoms. Can you help me check what might be wrong?" },
    { icon: <Apple className="w-4 h-4" />, text: "Diet Advice", prompt: "What is a healthy diet for my pet?" },
    { icon: <Stethoscope className="w-4 h-4" />, text: "Vaccination Info", prompt: "What are the essential vaccines for a new pet?" },
  ];

  const handleRename = (chatId: string) => {
    if (renamingText.trim()) {
      renameChat(chatId, renamingText);
      setShowRenameModal(null);
      setRenamingText("");
    }
  };

  const handleDeleteChat = (chatId: string) => {
    if (confirm(`Delete "${chats.find(c => c.id === chatId)?.name}"?`)) {
      deleteChat(chatId);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-slate-100 dark:bg-slate-950 flex transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-sm">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => createChat()}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            + New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chats.map((chat) => {
            const last = chat.messages[chat.messages.length - 1]?.text || "New chat";
            const isActive = chat.id === activeChatId;
            return (
              <div
                key={chat.id}
                className={`group p-3 rounded-lg cursor-pointer transition-all ${
                  isActive
                    ? "bg-indigo-100 dark:bg-indigo-900/40"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div onClick={() => setActiveChat(chat.id)} className="mb-2">
                  <div className="font-medium text-sm text-slate-900 dark:text-white truncate">
                    {chat.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate line-clamp-1">
                    {last.substring(0, 50)}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setShowRenameModal(chat.id);
                      setRenamingText(chat.name);
                    }}
                    className="flex-1 text-xs py-1 px-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded transition-colors"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => handleDeleteChat(chat.id)}
                    className="flex-1 text-xs py-1 px-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
        {/* Chat Header */}
        <div className="px-8 py-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <img
            src="https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&q=80&w=80&h=80"
            alt="AI Pet"
            className="w-12 h-12 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              AI Pet Assistant
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {chats.find((c) => c.id === activeChatId)?.name || "New Chat"}
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex max-w-xl gap-3 ${
                  msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`px-4 py-3 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  }`}
                >
                  <div className="text-sm leading-relaxed markdown-body">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-lg flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          {messages.length < 3 && !isLoading && (
            <div className="flex flex-wrap gap-2 justify-start">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(undefined, action.prompt)}
                  className="flex items-center gap-2 px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                >
                  {action.icon}
                  {action.text}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-8 py-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form onSubmit={(e) => handleSend(e)} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your pet..."
              className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-96">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Rename Chat
            </h3>
            <input
              type="text"
              value={renamingText}
              onChange={(e) => setRenamingText(e.target.value)}
              placeholder="Chat name..."
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename(showRenameModal);
                if (e.key === "Escape") setShowRenameModal(null);
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRenameModal(null)}
                className="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRename(showRenameModal)}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

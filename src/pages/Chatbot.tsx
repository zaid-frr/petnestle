import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, Activity, Stethoscope, Apple } from "lucide-react";
import { GoogleGenAI } from "@google/genai";

// Lazy initialize to prevent app crash if env var is missing
let aiClient: GoogleGenAI | null = null;
const getAIClient = () => {
  if (!aiClient) {
    // @ts-ignore - Handle both Vite's import.meta.env and Node's process.env
    const apiKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'undefined' || apiKey === 'null' || apiKey === '') {
      console.error("GEMINI_API_KEY is missing. Chatbot will not work.");
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm the PetNestle AI Assistant powered by Gemini. How can I help you with your pet today?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!predefinedText) setInput("");
    setIsLoading(true);

    try {
      const client = getAIClient();
      if (!client) {
        throw new Error("API_KEY_MISSING");
      }
      
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: textToSend,
        config: {
          systemInstruction: "You are a helpful veterinary and pet care assistant for PetNestle. Answer questions about pet health, training, and general care. Keep your answers concise, friendly, and helpful. Always advise users to consult a real vet for serious medical emergencies. Use markdown for formatting if needed."
        }
      });

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: response.text || "Sorry, I couldn't process that.",
          sender: "bot",
        },
      ]);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      
      let errorMessage = "Oops! I'm having trouble connecting to my brain right now. Please try again later.";
      
      if (error.message === "API_KEY_MISSING" || (error.message && error.message.includes("API key"))) {
        errorMessage = "Configuration Error: The Gemini API Key is missing. If you are on Vercel, please make sure you added GEMINI_API_KEY to your Environment Variables and **you must trigger a new deployment** for it to take effect.";
      }
      
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: errorMessage,
          sender: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { icon: <Activity className="w-4 h-4" />, text: "Symptom Checker", prompt: "My pet is showing some symptoms. Can you help me check what might be wrong?" },
    { icon: <Apple className="w-4 h-4" />, text: "Diet Advice", prompt: "What is a healthy diet for my pet?" },
    { icon: <Stethoscope className="w-4 h-4" />, text: "Vaccination Info", prompt: "What are the essential vaccines for a new pet?" },
  ];

  return (
    <div className="py-12 bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-teal-950 min-h-[calc(100vh-4rem)] flex flex-col transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow flex flex-col">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-teal-400 blur-xl opacity-20 rounded-full"></div>
            <img 
              src="https://images.unsplash.com/photo-1535295972055-1c762f4483e5?auto=format&fit=crop&q=80&w=200&h=200" 
              alt="AI Robot Pet" 
              className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-lg relative z-10"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-0 right-0 bg-teal-500 rounded-full p-1.5 border-2 border-white dark:border-slate-800 z-20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">AI Pet Assistant</h1>
          <p className="text-slate-600 dark:text-slate-400">Powered by Google Gemini</p>
        </div>

        <div className="flex-grow bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700 flex flex-col overflow-hidden h-[600px]">
          {/* Chat Messages */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"} items-start gap-3`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.sender === "user" ? "bg-teal-600 text-white" : "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"}`}>
                    {msg.sender === "user" ? <User className="h-5 w-5" /> : <Bot className="h-6 w-6" />}
                  </div>
                  <div
                    className={`px-5 py-4 rounded-2xl shadow-sm ${
                      msg.sender === "user"
                        ? "bg-teal-600 text-white rounded-tr-none"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none shadow-md"
                    }`}
                  >
                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex max-w-[85%] flex-row items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div className="px-5 py-4 rounded-2xl shadow-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none flex items-center gap-3 shadow-md">
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">Gemini is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length < 3 && !isLoading && (
            <div className="px-6 py-3 bg-white/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-2 justify-center">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(undefined, action.prompt)}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 rounded-full text-sm font-medium transition-colors border border-slate-200 dark:border-slate-600 hover:border-indigo-200 dark:hover:border-indigo-800 shadow-sm"
                >
                  {action.icon}
                  {action.text}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-700">
            <form onSubmit={(e) => handleSend(e)} className="flex gap-3 max-w-4xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Gemini about your pet..."
                className="flex-grow px-6 py-4 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-indigo-600 text-white p-4 rounded-full hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { FiSend, FiCpu, FiMessageSquare, FiUser, FiZap } from "react-icons/fi";

type Message = {
  id: number;
  role: "user" | "ai";
  text: string;
};

const SUGGESTED_PROMPTS = [
  "How can I improve my Leadership score?",
  "Recommend activities for AI Engineering.",
  "Help me reflect on my recent workshop.",
  "What SDC credits should I target next?",
];

const MOCK_AI_RESPONSES = [
  "Based on your profile, I recommend joining the 'Public Speaking Club' to boost your Leadership score by up to 10 points.",
  "For an AI Engineering career, you should focus on the 'Machine Learning Bootcamp' activity next semester. It perfectly aligns with your gaps.",
  "That's a great question! Let's break down your SDC credits. You currently need 20 more credits in the Technical domain.",
  "Reflection is key. Try writing down three things you learned and one thing you struggled with during the workshop.",
];

export default function AIMentorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      text: "Hello! I'm your SAMAM AI Mentor. I can help you with learning recommendations, career guidance, and competency analysis. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const newMsg: Message = { id: Date.now(), role: "user", text };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setIsTyping(true);

    // Mock AI response delay
    setTimeout(() => {
      const randomResponse = MOCK_AI_RESPONSES[Math.floor(Math.random() * MOCK_AI_RESPONSES.length)];
      setMessages((prev) => [...prev, { id: Date.now(), role: "ai", text: randomResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-950 rounded-t-xl border border-gray-100 dark:border-zinc-800 p-5 flex items-center gap-3 flex-shrink-0 shadow-sm">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
          <FiCpu size={20} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">AI Mentor</h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400">Powered by SAMAM Intelligence</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-gray-50 dark:bg-zinc-900 border-x border-gray-100 dark:border-zinc-800 overflow-y-auto p-5 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === "user" ? "bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300" : "bg-blue-600 text-white"
            }`}>
              {msg.role === "user" ? <FiUser size={14} /> : <FiZap size={14} />}
            </div>
            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user" 
                ? "bg-blue-600 text-white rounded-tr-none" 
                : "bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 text-gray-700 dark:text-gray-300 rounded-tl-none shadow-sm"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-600 text-white">
              <FiZap size={14} />
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-tl-none shadow-sm flex gap-1.5 items-center">
              <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-zinc-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-zinc-600 animate-bounce delay-75" />
              <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-zinc-600 animate-bounce delay-150" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-zinc-950 rounded-b-xl border border-gray-100 dark:border-zinc-800 p-4 shadow-sm flex-shrink-0">
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
            >
              <FiMessageSquare size={10} /> {prompt}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            placeholder="Ask me anything about your learning journey..."
            className="flex-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors text-gray-900 dark:text-gray-100"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors flex-shrink-0"
          >
            <FiSend size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

interface Message {
  role: "user" | "bot";
  content: string;
  isLoading?: boolean;
}

export default function GuestPage() {
  const [query, setQuery] = useState(""); // For initial input
  const [input, setInput] = useState(""); // For chat input
  const [chatStarted, setChatStarted] = useState(false); // Switch UI
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingState, setTypingState] = useState<{ index: number; text: string } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, chatStarted]);

  // Function to send message to AI
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "bot", content: "", isLoading: true },
    ]);
    setInput("");

    // Call AI API
    let botResponse = "No response";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      botResponse = data.choices?.[0]?.message?.content || "No response";
    } catch (err) {
      botResponse = "⚠️ Error: could not reach Astra AI";
    }

    // Typing animation
    setMessages((prev) => {
      const botIndex = prev.length - 1;
      const updated: Message[] = [...prev.slice(0, -1), { role: "bot", content: botResponse }];
      let i = 0;
      const interval = setInterval(() => {
        i++;
        if (i <= botResponse.length) {
          setTypingState({ index: botIndex, text: botResponse.slice(0, i) });
        } else {
          clearInterval(interval);
          setTypingState(null);
          setMessages((finalPrev) => {
            const finalUpdated = [...finalPrev];
            finalUpdated[botIndex] = { role: "bot", content: botResponse };
            return finalUpdated;
          });
        }
      }, 5);
      return updated;
    });
  }, []);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setChatStarted(true); // Switch UI
    sendMessage(query);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col items-center h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-[0_0_25px_rgba(168,85,247,0.7)]">
          Astra <span className="text-indigo-300">AI</span>
        </h1>
      </div>

      {!chatStarted ? (
        // Initial Search UI
        <div className="flex flex-col items-center justify-center flex-1">
          <h2 className="text-xl sm:text-3xl font-medium text-gray-300 mb-10 mt-5">
            Ask Astra AI anything
          </h2>
          <form
            onSubmit={handleInitialSubmit}
            className="flex w-11/12 min-w-3xl sm:w-full max-w-lg items-center bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700 p-1"
          >
            <input
              type="text"
              placeholder="Type your question..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-3 sm:px-4 py-3 text-base sm:text-lg bg-transparent text-white placeholder-gray-400 outline-none"
            />
            <button
              type="submit"
              className="ml-2 sm:ml-3 px-4 sm:px-5 py-3 sm:py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-transform cursor-pointer text-white flex items-center justify-center"
            >
              <Search size={20} />
            </button>
          </form>
        </div>
      ) : (
        // Chat Interface
        <>
          <div className="flex-1 w-6xl overflow-y-auto px-4 py-6 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              let text = msg.content;
              if (typingState && typingState.index === idx) text = typingState.text;

              return (
                <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-md max-w-[80%] ${
                      isUser
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                        : "bg-gray-800 text-gray-100 border border-gray-700"
                    }`}
                  >
                    {msg.isLoading ? "Thinking..." : text}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={handleChatSubmit}
            className="flex items-center min-w-6xl p-4 rounded-4xl bg-gray-900 border-t border-gray-800"
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-3 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              className="ml-3 p-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 active:scale-95 transition-transform"
            >
              <PaperAirplaneIcon className="w-5 h-5 text-white" />
            </button>
          </form>
        </>
      )}

      {/* Footer */}
      <p className="text-gray-500 text-sm text-center py-2">
        Project by <span className="text-indigo-400 font-medium">Abdul Saboor</span>
      </p>
    </div>
  );
}

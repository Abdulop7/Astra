// app/context/chatContext.tsx
"use client";
import { createContext, useContext, useState, useCallback } from "react";

type Message = { role: "user" | "bot"; content: string; isLoading?: boolean };
type Chat = { id: string; messages: Message[] };

const ChatContext = createContext<any>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const [activeChatId, setActiveChatId] = useState<string | null>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("astra_chat_active");
        }
        return null;
    });

    const [chats, setChats] = useState<Chat[]>(() => {
        // ✅ Load existing chats from localStorage
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("astra_chat_chats");
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });
    

    const ensureChatExists = useCallback(
        (id: string) => {
            setChats((prev) => {
                if (prev.some((c) => c.id === id)) return prev;
                return [...prev, { id, messages: [] }];
            });
        },
        [setChats]
    );

    const setActiveChat = useCallback((id: string) => {
        setActiveChatId(id);
    }, []);

    const sendMessage = useCallback(
  async (chatId: string, input: string) => {
    if (!input.trim()) return;

    // 1️⃣ Add user message + bot placeholder
    setChats((prev) => {
      const updated = prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                { role: "user", content: input },
                { role: "bot", content: "", isLoading: true }, // placeholder
              ],
            }
          : chat
      );

      // ✅ Update localStorage here
      localStorage.setItem("astra_chat_chats", JSON.stringify(updated));

      return updated;
    });

    // 2️⃣ Call API
    let botResponse = "No response";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      botResponse = data.choices?.[0]?.message?.content || "No response";
    } catch (err) {
      console.error("sendMessage error:", err);
      botResponse = "Error: failed to fetch response";
    }

    // 3️⃣ Replace placeholder with real bot response
    setChats((prev) => {
      const updated = prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [
                ...chat.messages.slice(0, -1), // remove placeholder
                { role: "bot", content: botResponse },
              ],
            }
          : chat
      );

      // ✅ Update localStorage here as well
      localStorage.setItem("astra_chat_chats", JSON.stringify(updated));

      return updated;
    });
  },
  [setChats]
);



    return (
        <ChatContext.Provider
            value={{
                chats,
                activeChatId,
                setActiveChat,
                ensureChatExists,
                sendMessage,
                setChats
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    return useContext(ChatContext);
}

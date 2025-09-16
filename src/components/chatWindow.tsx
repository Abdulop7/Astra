"use client";

import { useChat } from "@/app/context/chatContext";
import ChatHeader from "./user/header";
import { useCallback, useEffect, useRef, useState } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { Search } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

interface Message {
    role: "user" | "bot";
    content: string;
    isLoading?: boolean;
}
type ChatCollection = { chatId: string; title: string };

type Chat = {
    chatId: string;
    title: string;
};

interface ApiMessage {
    userPrompt?: string;
    botResponse?: string;
}
export interface ChatContextType {
    collection: Chat[];   // ✅ add this line
    addChat: (
        chat: Chat | ((prevCollection: Chat[]) => Chat[])
    ) => void;
    getCurrentUserId: () => Promise<{ userId: string; name?: string; email?: string } | null>;
}


export default function ChatWindow({ propChatId }: { propChatId: string | null }) {

    const [input, setInput] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const chatContext = useChat();
    if (!chatContext) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    const { getCurrentUserId, addChat, collection } = chatContext;
    const params = useParams();
    const chatId = propChatId || (params?.chatId as string); // ✅ always resolve chatId
    const hasChatBeenCreatedRef = useRef(false);


    const firstSentRef = useRef(false); // 🔹 only send once

    const [messages, setMessages] = useState<Message[]>([]);
    const [typingState, setTypingState] = useState<{
        index: number;
        text: string;
    } | null>(null);

    // ✅ Scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    useEffect(() => {
        // When chatId or collection changes, update the ref
        const chatExists = collection.some((c: ChatCollection) => c.chatId === chatId);
        if (chatExists) {
            hasChatBeenCreatedRef.current = true;
            console.log(`♻️ hasChatBeenCreatedRef set : ${hasChatBeenCreatedRef.current} from collection:`, chatId);
        }
    }, [chatId, collection]);



    // ✅ Load chats from API when chatId changes
    useEffect(() => {
        if (!chatId) return;

        let cancelled = false;

        async function fetchChat() {
            try {
                console.log("📡 fetchChat called with chatId:", chatId);
                const data = await fetch("https://f3sdxgem9h.execute-api.ap-south-2.amazonaws.com/getChats", {
                    method: "POST",
                    body: JSON.stringify({ chatId }),
                });
                const res = await data.json();

                console.log("📥 fetchChat response:", res);

                if (!cancelled && Array.isArray(res.messages)) {

                    // Inside fetchChat
                    if (res.title) {
                        console.log("📝 Checking if chat exists in collection...");

                        const chatExists = collection.some((c: Chat) => c.chatId === chatId);
                        console.log("   chatExists:", chatExists);

                        if (!chatExists) {
                            console.log("📌 Creating new chat in context:", { chatId, title: res.title });
                            addChat({ chatId, title: res.title }); // ✅ Pass object directly
                            hasChatBeenCreatedRef.current = true;
                        } else {
                            console.log("✅ Chat already exists, skipping addChat");
                        }
                    }



                    // Convert API format → UI format
                    const formatted: Message[] = (res.messages as ApiMessage[]).flatMap((msg: ApiMessage) => {
                        const arr: Message[] = [];
                        if (msg.userPrompt) {
                            arr.push({ role: "user", content: msg.userPrompt });
                        }
                        if (msg.botResponse) {
                            arr.push({ role: "bot", content: msg.botResponse });
                        }
                        return arr;
                    });

                    setMessages((prev) => {
                        if (formatted.length === 0) return prev;

                        const merged = [...prev];
                        formatted.forEach((msg: Message) => {
                            const exists = merged.some(
                                (m) => m.role === msg.role && m.content === msg.content
                            );
                            if (!exists) {
                                merged.push(msg);
                            }
                        });
                        return merged;
                    });




                    if (formatted.length === 0 && !firstSentRef.current) {
                        if (!searchParams) return;
                        const firstLine = searchParams.get("first");
                        if (firstLine) {
                            firstSentRef.current = true;
                            sendMessage(chatId, firstLine);
                            // Remove query param
                            const newUrl = `/c/${chatId}`;
                            window.history.replaceState({}, document.title, newUrl);
                        }
                    }
                }
            } catch (err) {
                console.log("Failed to fetch chat", err);
            }
        }

        fetchChat();
        return () => { cancelled = true; };
    }, [chatId, addChat]);




    // ✅ Send message logic (moved here)
    const sendMessage = useCallback(
        async (chatId: string, input: string) => {
            if (!input.trim()) return;

            console.log("✉️ Sending message:", input);

            // Add user + placeholder bot
            setMessages((prev) => [
                ...prev,
                { role: "user", content: input },
                { role: "bot", content: "", isLoading: true },
            ]);

            // Call bot API
            let botResponse = "No response";
            try {
                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: input }),
                });
                const data = await res.json();
                botResponse = data.choices?.[0]?.message?.content || "No response";
                console.log("🤖 Bot response:", botResponse);
                setInput("");
            } catch (err) {
                console.error("❌ sendMessage bot API error:", err);
                botResponse = "Error: failed to fetch response";
            }

            // Update last bot message
            setMessages((prev) => {
                const botIndex = prev.length - 1;
                const updated: Message[] = [
                    ...prev.slice(0, -1),
                    { role: "bot" as const, content: botResponse }
                ];
                console.log("💬 Messages after bot update:", updated);

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
                            finalUpdated[botIndex] = { role: "bot" as const, content: botResponse };
                            return finalUpdated;
                        });
                    }
                }, 5);

                return updated;
            });


            // Save chat & add to context safely
            const userData = await getCurrentUserId();
            const userId = userData?.userId;
            const title = !hasChatBeenCreatedRef.current ? input.slice(0, 30) : undefined;
            await fetch("https://q5qbvbzaf2.execute-api.ap-south-2.amazonaws.com/saveChat", {
                method: "POST",
                body: JSON.stringify({
                    chatId,
                    userId,
                    title: title,
                    timestamp: new Date().toISOString(),
                    userPrompt: input,
                    botResponse,
                }),
            });
            console.log("💾 Saving chat:", { chatId, userId, title });

            // ✅ Add chat to context if it doesn't exist
            if (!hasChatBeenCreatedRef.current) {
                addChat({ chatId, title: input.slice(0, 30) }, { checkExists: true });
                hasChatBeenCreatedRef.current = true;
            }

        },
        [getCurrentUserId, addChat]
    );


    useEffect(() => {
        if (!searchParams) return;
        if (!firstSentRef.current && chatId && messages.length === 0) {
            const firstLine = searchParams.get("first");
            if (firstLine) {
                // Then call bot
                sendMessage(chatId, firstLine);
                firstSentRef.current = true;

                // Remove query param from URL
                const newUrl = `/c/${chatId}`;
                window.history.replaceState({}, document.title, newUrl);
            }
        }
    }, [chatId, searchParams, sendMessage, messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        if (!chatId) {
            const newId = uuidv4();
            router.push(`/c/${newId}?first=${encodeURIComponent(input)}`);
            setInput(""); // clear input
            return; // exit, page will load ChatPageInner with first text
        }

        await sendMessage(chatId, input);

    };

    return (
        <div className="flex flex-col w-full h-full bg-gray-1000">
            {messages.length === 0 ? (
                <div className="flex flex-col w-full h-screen items-center justify-center flex-1">
                    <h2 className="text-xl sm:text-3xl font-medium text-gray-300 mb-10 mt-20">
                        {"What's the agenda today?"}
                    </h2>
                    <div className="flex w-11/12 sm:w-full max-w-lg items-center bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700 p-1">
                        <input
                            type="text"
                            placeholder="Ask Astra AI..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            className="flex-1 px-3 sm:px-4 py-3 text-base sm:text-lg bg-transparent text-white placeholder-gray-400 outline-none"
                        />
                        <button
                            onClick={handleSend}
                            className="ml-2 sm:ml-3 px-4 sm:px-5 py-3 sm:py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-transform cursor-pointer text-white flex items-center justify-center"
                        >
                            <Search size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <ChatHeader />
                    <div className="flex-1 w-full flex flex-col h-full pt-3 overflow-y-auto px-4 py-6 custom-scrollbar">
                        <div className="space-y-8 w-full max-w-4xl mx-auto">
                            {messages.map((msg, idx) => {
                                const isUser = msg.role === "user";

                                // 👇 Show typing effect if it's the active message
                                let text = msg.content;
                                if (typingState && typingState.index === idx) {
                                    text = typingState.text;
                                }

                                return (
                                    <div
                                        key={idx}
                                        className={`flex w-full ${isUser ? "justify-end" : "justify-start"
                                            }`}
                                    >
                                        <div
                                            className={`px-4 py-3 rounded-2xl shadow-md max-w-[80%] ${isUser
                                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                                                : "bg-gray-800 text-gray-100 border border-gray-700"
                                                }`}
                                        >
                                            <p>{text || (msg.isLoading ? "Thinking..." : "")}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>
                    </div>
                    <div className="p-4 flex flex-col items-center space-y-2">
                        <div className="flex items-center bg-gray-900 border border-gray-700 rounded-full shadow-inner px-4 py-2 w-full max-w-4xl">
                            <input
                                type="text"
                                placeholder="Type your message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base"
                            />
                            <button
                                onClick={handleSend}
                                className="ml-3 p-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 active:scale-95 transition-transform shadow-lg"
                            >
                                <PaperAirplaneIcon className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 text-center">
                            Astra AI can make mistakes. Check important info
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}

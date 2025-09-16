// // app/page.tsx (or Chats.tsx)
// "use client";
// import { useState, useEffect, useRef } from "react";
// import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
// import { Search } from "lucide-react";
// import ChatHeader from "./header";
// import { useChat } from "@/app/context/chatContext";

// interface ChatMessage {
//   role: "user" | "bot";
//   content: string;
//   isLoading?: boolean;
// }

// export default function Chats() {
//   const { chats, activeChatId, sendMessage } = useChat();
//   const [messages, setMessages] = useState<ChatMessage[]>([]);
//   const [input, setInput] = useState("");
//   const [typingIndex, setTypingIndex] = useState<number | null>(null);
//   const [displayedText, setDisplayedText] = useState("");
//   const chatEndRef = useRef<HTMLDivElement>(null);

//   const chat = chats.find((c) => c.id === activeChatId);

//   const handleSend = async () => {
//     if (!input.trim()) return;

//     const userMessage: ChatMessage = { role: "user", content: input };
//     setMessages((prev) => [...prev, userMessage, { role: "bot", content: "", isLoading: true }]);
//     const userInput = input;
//     setInput("");
//     sendMessage(input);

//     const res = await fetch("/api/chat", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ message: userInput }),
//     });

//     const data = await res.json();
//     const botResponse = data.choices?.[0]?.message?.content || "No response";

//     setMessages((prev) => {
//       const updated = [...prev];
//       updated[updated.length - 1] = { role: "bot", content: botResponse };
//       return updated;
//     });

//     // ✅ After message updates, set typing index properly
//     setTypingIndex(messages.length + 1); // index of the new bot message
//     setDisplayedText("");
//   };

//   // 🔹 Typewriter effect
//   useEffect(() => {
//     if (typingIndex === null) return;

//     const fullText = messages[typingIndex]?.content || "";
//     let i = 0;

//     const interval = setInterval(() => {
//       setDisplayedText((prev) => prev + fullText.charAt(i));
//       i++;
//       if (i >= fullText.length) {
//         clearInterval(interval);
//         setTypingIndex(null);
//       }
//     }, 10);

//     return () => clearInterval(interval);
//   }, [typingIndex, messages]);

//   // 🔹 Auto-scroll to bottom
//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, displayedText]);

//   return (
//     <div className="flex flex-col w-full h-full bg-gray-1000">
//       {messages.length === 0 ? (
//         // ================= Empty State =================
//         <div className="flex flex-col w-full h-screen items-center justify-center flex-1">
//           <h2 className="text-xl sm:text-3xl font-medium text-gray-300 mb-10 mt-20">
//             What's the agenda today?
//           </h2>

//           {/* First Input Box */}
//           <div className="flex w-11/12 sm:w-full max-w-lg items-center bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700 p-1">
//             <input
//               type="text"
//               placeholder="Ask Astra AI..."
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               className="flex-1 px-3 sm:px-4 py-3 text-base sm:text-lg bg-transparent text-white placeholder-gray-400 outline-none"
//             />
//             <button
//               onClick={handleSend}
//               className="ml-2 sm:ml-3 px-4 sm:px-5 py-3 sm:py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-transform cursor-pointer text-white flex items-center justify-center"
//             >
//               <Search size={20} />
//             </button>
//           </div>
//         </div>
//       ) : (
//         <>
//           {/* Header */}
//           <ChatHeader />

//           {/* Chat Messages */}
//           <div className="flex-1 w-full flex flex-col h-full pt-3 overflow-y-auto px-4 py-6 custom-scrollbar">
//             <div className="space-y-8 w-full max-w-4xl mx-auto">
//               {messages.map((msg, idx) => {
//                 const isUser = msg.role === "user";
//                 let text = msg.content;
//                 if (msg.isLoading) text = "Thinking...";
//                 if (typingIndex === idx) text = displayedText;

//                 return (
//                   <div
//                     key={idx}
//                     className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
//                   >
//                     <div
//                       className={`px-4 py-3 rounded-2xl shadow-md max-w-[80%] ${
//                         isUser
//                           ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
//                           : "bg-gray-800 text-gray-100 border border-gray-700"
//                       }`}
//                     >
//                       <p>{text}</p>
//                     </div>
//                   </div>
//                 );
//               })}
//               <div ref={chatEndRef} />
//             </div>
//           </div>

//           {/* Input Area */}
//           <div className="p-4 flex flex-col items-center space-y-2">
//             <div className="flex items-center bg-gray-900 border border-gray-700 rounded-full shadow-inner px-4 py-2 w-full max-w-4xl">
//               <input
//                 type="text"
//                 placeholder="Type your message..."
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base"
//               />
//               <button
//                 onClick={handleSend}
//                 className="ml-3 p-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 active:scale-95 transition-transform shadow-lg"
//               >
//                 <PaperAirplaneIcon className="w-5 h-5 text-white" />
//               </button>
//             </div>

//             {/* Disclaimer */}
//             <p className="text-xs text-gray-400 mt-1 text-center">
//               Astra AI can make mistakes. Check important info
//             </p>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

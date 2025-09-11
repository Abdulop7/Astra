"use client";

import { ChatProvider, useChat } from "@/app/context/chatContext";
import ChatWindow from "@/components/chatWindow";
import Sidebar from "@/components/user/sidebar";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

type Props = { params: { chatId: string } };

function ChatPageInner({ chatId }: { chatId: string }) {
  const searchParams = useSearchParams();
  const { sendMessage, ensureChatExists, setActiveChat } = useChat();
  const firstSentRef = useRef(false); // 🔹 only send once

  useEffect(() => {
    if (!chatId) return;

    ensureChatExists(chatId);
    setActiveChat(chatId);

    // Send first message only once
    if (!firstSentRef.current) {
      const firstLine = searchParams.get("first");
      if (firstLine) {
        sendMessage(chatId, firstLine);
        firstSentRef.current = true; // mark as sent
        // Remove query param so it doesn’t resend on reload
        window.history.replaceState({}, document.title, `/c/${chatId}`);
      }
    }
  }, [chatId, ensureChatExists, setActiveChat, sendMessage, searchParams]);

  return (
    <div className="flex w-full h-screen">
      <Sidebar email="abdulsaboora691@gmail.com" />
      <ChatWindow chatId={chatId} />
    </div>
  );
}

export default function ChatPage({ params }: Props) {
  return (
    <ChatProvider>
      <ChatPageInner chatId={params.chatId} />
    </ChatProvider>
  );
}

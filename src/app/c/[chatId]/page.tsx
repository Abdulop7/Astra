"use client";

import { ChatProvider} from "@/app/context/chatContext";
import ChatWindow from "@/components/chatWindow";
import Sidebar from "@/components/user/sidebar";
import { useEffect,useState } from "react";
import { v4 as uuidv4 } from "uuid";

type Props = { params: { chatId: string } };

function ChatPageInner({ chatId }: { chatId: string }) {

  const [currentChatId] = useState(() => chatId || uuidv4());

  console.log("Initial Chat ID is : ",currentChatId);
  

  useEffect(() => {
    if (!chatId) return;

  }, [chatId]);


  return (
    <div className="flex w-full h-screen">
      <Sidebar />
      <ChatWindow propChatId={currentChatId} />
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

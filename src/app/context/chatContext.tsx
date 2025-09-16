// app/context/chatContext.tsx
"use client";
import { getUserPool } from "@/lib/cognito";
import { CognitoUser, CognitoUserSession } from "amazon-cognito-identity-js";
import { createContext, useContext, useState, useCallback, useEffect } from "react";

interface CognitoUserInfo {
  userId: string; // sub
  name?: string;
  email?: string;
  profilePicUrl?:string ;
}

type ChatCollection = { chatId: string; title: string };

interface ChatContextType {
  collection: ChatCollection[];
  fetchChatCollection: () => Promise<void>;
  getCurrentUserId: () => Promise<CognitoUserInfo | null>;
  addChat: (newChat: ChatCollection, options?: { checkExists?: boolean }) => boolean;
  markChatAsCreated: (chatId: string) => void;
  isChatCreated: (chatId: string) => boolean;
  userInfo: CognitoUserInfo | null;
}


const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const pool = getUserPool();

  const [collection, setCollection] = useState<ChatCollection[]>([]);
  const [createdChats, setCreatedChats] = useState<Set<string>>(new Set());
  const [userInfo, setUserInfo] = useState<CognitoUserInfo | null>(null);
  

  
const getCurrentUserId = useCallback((): Promise<CognitoUserInfo | null> => {
  return new Promise((resolve) => {
    const currentUser: CognitoUser | null = pool.getCurrentUser();

    if (!currentUser) {
      resolve(null);
      return;
    }

    currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        resolve(null);
        return;
      }

      const payload = session.getIdToken().decodePayload() as {
        sub: string;
        name?: string;
        email?: string;
      };

      resolve({
        userId: payload.sub,
        name: payload.name,
        email: payload.email,
      });
    });
  });
}, []); // ✅ stable dependency

  useEffect(() => {
    getCurrentUserId().then((info) => {
      setUserInfo(info || null);
    });
  }, []);

  const fetchChatCollection = useCallback(async () => {
    try {
      const userData = await getCurrentUserId(); // ✅ Cognito userId
      const userId = userData?.userId

      const res = await fetch(
        "https://8dyke468il.execute-api.ap-south-2.amazonaws.com/getCollection",
        {
          method: "POST",
          body: JSON.stringify({ userId }),
        }
      );

      if (!res.ok) throw new Error("Failed to fetch chat collection");

      const data = await res.json();
      const chats = data.chats || [];

      setCollection((prev) => {
        const map = new Map<string, { chatId: string; title: string }>();

        // Add previous collection first
        prev.forEach((chat) => map.set(chat.chatId, chat));

        // Add new chats, preserve existing title if incoming one is undefined
        chats.forEach((chat: { chatId: string; title?: string }) => {
          const existing = map.get(chat.chatId);
          const title = chat.title || existing?.title || "Untitled Chat";
          map.set(chat.chatId, { chatId: chat.chatId, title });
        });

        return Array.from(map.values());
      });
    } catch (err) {
      console.error("❌ fetchChatCollection error:", err);
      setCollection([]);
    }
  }, []);




  function addChat(newChat: { chatId: string; title: string }, options?: { checkExists?: boolean }) {

    if (!newChat || !newChat.chatId) {
      console.warn("⚠️ Attempted to add invalid chat:", newChat);
      return false;
    }
    if (options?.checkExists) {
      const exists = collection.some(c => c.chatId === newChat.chatId);
      if (exists) return false; // ❌ Already exists, skip
    }
    setCollection(prev => [...prev, newChat]);
    return true; // ✅ Chat added
  }


  const markChatAsCreated = (chatId: string) => {
    setCreatedChats(prev => new Set([...prev, chatId]));
  };

  const isChatCreated = (chatId: string) => createdChats.has(chatId);


  return (
    <ChatContext.Provider
      value={{
        collection,
        fetchChatCollection,
        getCurrentUserId,
        addChat,
        markChatAsCreated,
        isChatCreated,
        userInfo
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}

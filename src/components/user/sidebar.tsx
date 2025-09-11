"use client"

// components/Sidebar.tsx
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useChat } from "@/app/context/chatContext";
import { useRouter } from "next/navigation";

interface SidebarProps {
  email: string;
  profilePicUrl?: string;
}

export default function Sidebar({ email, profilePicUrl }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false); // mobile
  const [isMinimized, setIsMinimized] = useState(false); // desktop
  const [hoveringLogo, setHoveringLogo] = useState(false);

  const router = useRouter();
  const { chats, setActiveChat, activeChatId } = useChat();

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50  text-white p-2 rounded-md shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <XMarkIcon className="w-7 h-7" />
        ) : (
          <Bars3Icon className="w-7 h-7" />
        )}
      </button>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden transition-opacity duration-300 ${isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`relative top-0 left-0 h-full bg-gray-900 text-white shadow-md flex flex-col justify-between z-50
        md:translate-x-0 transition-all duration-300
        ${isMinimized ? "w-16" : "w-64 md:w-72"}
        ${isOpen ? "flex" : "hidden"} md:flex`}
      >

        {/* Top: Logo + Minimize */}
        <div className="flex items-center justify-between p-4 relative">

          {/* If minimized & hovering → show expanded logo */}
          {isMinimized && hoveringLogo ? (
            <div
              className="bg-gray-700  p-1 cursor-pointer rounded-lg"
              onMouseLeave={() => setHoveringLogo(false)}
              onClick={() => setIsMinimized(false)}
            >
              <ChevronRightIcon className="w-8 h-8" />
            </div>
          ) : (
            /* Default Logo (with Link) */
            <Link href="/">
              <div
                className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-700 to-blue-600 rounded-lg text-white font-bold cursor-pointer"
                onMouseEnter={() => setHoveringLogo(true)}
              >
                A
              </div>
            </Link>
          )}
          {isOpen && (
            <XMarkIcon className="w-7 h-7" onClick={() => setIsOpen(false)} />
          )}

          {/* Collapse toggle (desktop only, visible only when not minimized) */}
          <div className="hidden md:flex">
            {!isMinimized && (
              <button
                onClick={() => {
                  setIsMinimized(true)
                  setHoveringLogo(false)
                }}
                className="p-1 rounded hover:bg-gray-700 transition cursor-pointer"
              >
                <ChevronLeftIcon className="w-8 h-8" />
              </button>
            )}
          </div>


        </div>

        {/* Actions (always below logo, even minimized) */}
        <div className="flex flex-col mt-10 px-2 space-y-3">
          <button className={`flex items-center ${isMinimized ? "justify-center" : ""} p-2 bg-gray-800 hover:bg-gray-700 rounded-md`}>
            <PlusIcon className="w-5 h-5" />
            {!isMinimized && (
              <span className="ml-2 text-sm font-medium">New Chat</span>
            )}
          </button>

          {isMinimized ? (
            <button className="flex items-center justify-center p-2 bg-gray-800 hover:bg-gray-700 rounded-md">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            </button>
          ) : (
            <div className="flex items-center justify-center p-2 bg-gray-800 rounded-md">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search chats..."
                className="ml-2 flex-1 bg-gray-800 text-sm text-white placeholder-gray-400 focus:outline-none"
              />
            </div>
          )}
        </div>



        {/* Chat list */}
        {!isMinimized && (
          <div className="flex-1 overflow-y-auto px-2 mt-10">
            <p className="text-sm font-normal pl-3 mb-2 text-gray-400">Chats</p>
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  setActiveChat(chat.id);
                  router.push(`/c/${chat.id}`);
                }}
                className={`px-3 py-2 rounded-lg font-light cursor-pointer hover:bg-gray-600 text-sm ${chat.id === activeChatId ? "bg-gray-700" : ""
                  }`}>
                {chat.title}
              </div>
            ))}
          </div>
        )}

        {/* Profile */}
        <div className={`flex items-center p-3 px-4  rounded-lg border-t-1 border-gray-700 hover:bg-gray-700 gap-2 transition cursor-pointer justify-center ${isMinimized ? "" : "m-2"}`}>
          {profilePicUrl ? (
            <Image
              src={profilePicUrl}
              alt="Profile"
              width={36}
              height={36}
              className="rounded-full"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gray-500 flex items-center justify-center text-black font-medium text-sm">
              {email.charAt(0).toUpperCase()}
            </div>
          )}
          {!isMinimized && (
            <span className="ml-2 text-sm truncate">{email}</span>
          )}
        </div>
      </div>
    </>
  );
}


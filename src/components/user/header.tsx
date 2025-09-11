import { TrashIcon } from "lucide-react";

export default function ChatHeader() {

    
    return (
        <div className="w-full border-b-1 border-gray-800">
            <div className=" flex items-center justify-end md:justify-between px-4 py-4 shadow-md ">
                {/* Left: Brand */}
                <h1 className="cursor-pointer hidden md:block text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                    Astra <span className="text-indigo-300">AI</span>
                </h1>

                {/* Right: Delete */}
                <button
                    className="cursor-pointer p-2 text-red-400 hover:text-red-500 rounded-lg hover:bg-red-400/10 transition-colors"
                >
                    <TrashIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    )
}

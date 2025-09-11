import React, { useState } from "react";
import { Search } from "lucide-react";

export default function GuestPage() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Searching for: ${query}`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <h1 className="text-5xl font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 drop-shadow-[0_0_25px_rgba(168,85,247,0.7)] tracking-wide">
        Astra <span className="text-indigo-300">AI</span>
      </h1>

      {/* Search Box */}
      <form
        onSubmit={handleSearch}
        className="flex w-11/12 sm:w-full max-w-lg items-center bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-700 p-1"
      >
        <input
          type="text"
          placeholder="Ask Astra AI..."
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

       {/* Footer Credit */}
      <p className="text-gray-500 text-sm mt-10 mb-2">
        Project by <span className="text-indigo-400 font-medium">Abdul Saboor</span>
      </p>

    </div>
  );
}

"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="flex w-full items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="flex flex-col items-center gap-6">
        {/* Brand Name */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wide bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
          Astra <span className="text-indigo-300">AI</span>
        </h1>

        {/* Loader animation */}
        <div className="flex gap-2">
          {[0, 0.2, 0.4].map((delay, i) => (
            <motion.span
              key={i}
              className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
              animate={{ y: [0, -8, 0] }}
              transition={{
                repeat: Infinity,
                duration: 0.6,
                ease: "easeInOut",
                delay,
              }}
            />
          ))}
        </div>

        <p className="text-gray-400 text-sm">Loading your experience...</p>
      </div>
    </div>
  );
}

"use client"

import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Page() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/check-user", { email });

      if (res.data.exists) {
        // User exists → redirect to login page with email
        router.push(`/log-in-or-create-account/password?email=${encodeURIComponent(email)}`);
      } else {
        // New user → redirect to signup page with email
        router.push(`/log-in-or-create-account/create?email=${encodeURIComponent(email)}`);
      }
    } catch (error: unknown) {
      if(error instanceof Error) console.error("Error checking user:", error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      {/* Top Brand */}
      <header className="p-6">
        <Link href={"/"}>
        <h1 className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
          Astra <span className="text-indigo-300">AI</span>
        </h1>
        </Link>
      </header>

      {/* Center Content */}
      <main className="flex flex-col items-center justify-center flex-1 px-4">
        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl font-normal mb-6 text-center">
           Log in or Sign up
        </h2>
        <p className="text-gray-400 mb-8 text-center max-w-md">
          Sign in to continue your journey with Astra AI’s powerful tools.
        </p>

        {/* Email Form */}
        <form
          onSubmit={handleContinue}
          className="w-full max-w-md flex flex-col gap-4"
        >
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 placeholder-gray-400 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold shadow-lg"
          >
            Continue
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center w-full max-w-md my-6">
          <div className="flex-grow h-px bg-gray-700"></div>
          <span className="px-3 text-gray-400 text-sm">or</span>
          <div className="flex-grow h-px bg-gray-700"></div>
        </div>

        {/* Third-party Providers */}
        <div className="w-full max-w-md flex flex-col gap-3">
          <button className="flex items-center justify-center gap-2 py-3 w-full rounded-xl bg-white text-gray-800 font-medium hover:bg-gray-100 transition">
            <FcGoogle size={22} /> Continue with Google
          </button>
          <button className="flex items-center justify-center gap-2 py-3 w-full rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
            <FaFacebook size={22} /> Continue with Facebook
          </button>
        </div>
      </main>
    </div>
  );
}

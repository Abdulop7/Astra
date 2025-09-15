"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
  const emailFromUrl = searchParams.get("email");
  const nameFromUrl = searchParams.get("name");
  if (emailFromUrl) {
    setEmail(decodeURIComponent(emailFromUrl));
    setName(decodeURIComponent(nameFromUrl));
  }
}, [searchParams]);


  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/confirm", { email, code });
      if (res.data.success) {

        router.push("/log-in-or-create-account/password"); // redirect after verify
      } else {
        alert("❌ Error: " + res.data.error);
      }
    } catch (err: any) {
      alert("Verification failed: " + err.message);
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
        <h2 className="text-3xl sm:text-4xl font-normal mb-6 text-center">
          Verify your account
        </h2>

        <form
          onSubmit={handleVerify}
          className="w-full max-w-md flex flex-col gap-4"
        >
{/* Display email (readonly, styled as info box) */}
<div className="w-full">
  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Account Email</p>
  <div className="px-4 py-3 rounded-lg bg-gradient-to-r from-gray-900 to-gray-800 border border-indigo-500/40 text-indigo-200 font-semibold shadow-md">
    {email || "your@email.com"}
  </div>
</div>



          {/* Confirmation Code */}
          <input
            type="text"
            placeholder="Enter confirmation code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 placeholder-gray-400 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold shadow-lg"
          >
            Confirm
          </button>

          <p className="text-sm text-gray-400 text-center mt-2">
            Already verified?{" "}
            <Link
              href="/log-in-or-create-account/password"
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Log in
            </Link>
          </p>
        </form>
      </main>
    </div>
  );
}

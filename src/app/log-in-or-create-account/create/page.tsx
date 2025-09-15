"use client";

import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export default function Page() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const emailFromUrl = searchParams.get("email");
    if (emailFromUrl) {
      setEmail(decodeURIComponent(emailFromUrl));
    }
  }, [searchParams]);

  const handleContinue = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const res = await axios.post("/api/auth/signup", {
      name,      // ✅ include name
      email,
      password,
    });

    if (res.data.success) {
      router.push(
        `/log-in-or-create-account/verify?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`
      );
    } else {
      alert("Error: " + res.data.error);
    }
  } catch (err: any) {
    alert("Signup failed: " + err.message);
  }
};


  // ✅ Password validation
  const validations = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
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
          Create an account
        </h2>

        <form
          onSubmit={handleContinue}
          className="w-full max-w-md flex flex-col gap-4"
        >
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 placeholder-gray-400 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />

          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 placeholder-gray-400 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />

          {/* Password with eye toggle */}
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 placeholder-gray-400 text-white outline-none focus:ring-2 focus:ring-indigo-500 transition pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          {/* Password requirements */}
          <div className="text-sm space-y-1 text-gray-400">
            <p className={validations.length ? "text-indigo-400" : "text-red-400"}>
              • At least 8 characters
            </p>
            <p className={validations.uppercase ? "text-indigo-400" : "text-red-400"}>
              • At least 1 uppercase letter
            </p>
            <p className={validations.lowercase ? "text-indigo-400" : "text-red-400"}>
              • At least 1 lowercase letter
            </p>
            <p className={validations.number ? "text-indigo-400" : "text-red-400"}>
              • At least 1 number
            </p>
            <p className={validations.special ? "text-indigo-400" : "text-red-400"}>
              • At least 1 special character
            </p>
          </div>

          <button
            type="submit"
            disabled={
              !validations.length ||
              !validations.uppercase ||
              !validations.lowercase ||
              !validations.number ||
              !validations.special
            }
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Continue
          </button>

          <p className="text-sm text-gray-400 text-center mt-2">
            Already have an account?{" "}
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

"use client";

import React, { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { AuthenticationDetails, CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";

const pool = new CognitoUserPool({
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
});

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const searchParams = useSearchParams();
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

    const user = new CognitoUser({ Username: email, Pool: pool });
    const authDetails = new AuthenticationDetails({ Username: email, Password: password });

    user.authenticateUser(authDetails, {
      onSuccess: (session) => {
        const idToken = session.getIdToken().getJwtToken();
        const payload = session.getIdToken().decodePayload();

        const userId = payload.sub;   // Cognito UUID
        const userEmail = payload.email;
        const userName = payload.name; // 👈 this comes from signup

        console.log("User:", userId, userEmail, userName);

        // Save in DynamoDB
        axios.post("https://3gdd3pytn2.execute-api.ap-south-2.amazonaws.com/register", {
          userId,
          email: userEmail,
          name: userName,
        });
        window.location.href = "/"; 
      },
      onFailure: (err) => {
        alert("Login failed: " + err.message);
      },
    });
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
        <h2 className="text-3xl sm:text-4xl font-normal mb-15 text-center">
          Enter your password
        </h2>

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

          {/* Password with eye toggle */}
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
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

          {/* Forgot password */}
          {/* <div className="text-right -mt-2">
            <Link
              href="/forgot-password"
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Forgot password?
            </Link>
          </div> */}

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

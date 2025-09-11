"use client"

// pages/index.tsx
import { useEffect, useState } from "react";

import Guest from "@/components/guest/Guest";
import GuestHeader from "@/components/guest/header";
import { isSignedIn } from "@/lib/cognito";
import { CognitoUserPool } from "amazon-cognito-identity-js";
import User from "@/components/user/User";
import { useChat } from "./context/chatContext";

const pool = new CognitoUserPool({
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
});

export default function Home() {
  const {
          setActiveChat
      } = useChat();
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  

  useEffect(() => {
    async function checkUser() {
      const status = await isSignedIn();
      setIsLoggedIn(status)
      console.log(status);
      setActiveChat(null)
    }

    checkUser();
  }, [isLoggedIn]);

  return isLoggedIn ? (
    <User/>
  ) : (
    <>
    <GuestHeader />
    <Guest/>
    </>
  );
}

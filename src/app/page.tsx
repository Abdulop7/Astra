"use client"

// pages/index.tsx
import { useEffect, useState } from "react";

import Guest from "@/components/guest/Guest";
import GuestHeader from "@/components/guest/header";
import { isSignedIn } from "@/lib/cognito";
import User from "@/components/user/User";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  

  useEffect(() => {
    async function checkUser() {
      const status = await isSignedIn();
      console.log(status);
      
      setIsLoggedIn(status)
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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && window.location.pathname !== "/login") {
      router.push("/login");
    } else if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [router]);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
    console.log("ok");

    router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    setIsAuthenticated(false);
    router.push("/login");
  };

  return { isAuthenticated, isLoading, login, logout };
}

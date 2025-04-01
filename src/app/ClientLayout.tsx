/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { Layout, Button } from "antd";
import { useAuth } from "@/hooks/useAuth";

const { Header, Content } = Layout;

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem("token");
    setShowLogout(!!token);
  }, []);

  // Watch for token changes
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      setShowLogout(!!token);
    };

    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("login", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("login", handleStorageChange);
    };
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fff",
          padding: "0 24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{ height: "32px", width: "auto" }}
          />
          <span style={{ fontSize: "18px", fontWeight: 600, color: "#1890ff" }}>
            Report Manager System
          </span>
        </div>
        {showLogout && (
          <Button
            type="primary"
            ghost
            onClick={() => {
              logout();
              setShowLogout(false);
            }}
          >
            Logout
          </Button>
        )}
      </Header>
      <Content style={{ padding: "24px" }}>{children}</Content>
    </Layout>
  );
}

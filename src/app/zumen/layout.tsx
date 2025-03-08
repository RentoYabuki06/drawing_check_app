"use client";

import Sidebar from "@/components/Sidebar";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ 
        display: "flex", 
        minHeight: "100vh",  // heightをminHeightに変更
        backgroundColor: "#ffffff" 
      }}
    >
      <Sidebar />
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        flex: 1,
        overflow: "auto"  // オーバーフローの制御を追加
      }}>
        {children}
      </div>
    </div>
  );
}

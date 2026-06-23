// src/app/(site)/layout.tsx
"use client"
import { SessionProvider } from "next-auth/react";
import '@/app/globals.css'
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <Navbar />
      {children}
      <Footer/>
    </SessionProvider>
  );
}
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth"; // ← Import your auth function
import ClientProvider from "./ClientProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Earth Design - Real Estate & Land Surveys in Cameroon",
  description:
    "Premium properties, professional land surveys, and quality construction services.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth(); // ← Fetch session on server

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider session={session}>
          <ClientProvider>{children}</ClientProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

// app/layout.tsx
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import AuthProvider from "./AuthProvider";
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
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider session={session}>
          <ClientProvider>{children}</ClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

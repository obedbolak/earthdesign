// app/layout.tsx  (Server Component - NO "use client")
import "./globals.css";
import ClientProvider from "./ClientProvider";  // We'll create this next

export const metadata = {
  title: "Earth Design - Real Estate Platform",
  description: "Premium properties in Cameroon",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
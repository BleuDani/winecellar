import type { Metadata } from "next";
import localFont from "next/font/local";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const aptos = localFont({
  src: [
    { path: "../public/fonts/Aptos.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Aptos-Italic.ttf", weight: "400", style: "italic" },
    { path: "../public/fonts/Aptos-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/Aptos-SemiBold-Italic.ttf", weight: "600", style: "italic" },
    { path: "../public/fonts/Aptos-Bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/Aptos-Bold-Italic.ttf", weight: "700", style: "italic" },
  ],
  variable: "--font-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const nickname = user?.user_metadata?.nickname as string | undefined;
  const title = nickname ? `${nickname}'s Wine Cellar` : "Wine Cellar";
  return {
    title,
    description: `${title} — personal wine cellar management`,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${aptos.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}

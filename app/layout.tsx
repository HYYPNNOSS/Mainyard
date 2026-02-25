import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Booking Platform",
  description: "Curated community booking platform.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper session={session}>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
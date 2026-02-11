"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, User } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  return (
    <nav className="bg-white border-b-8 border-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-24">
          {/* Logo */}
          <Link href="/" className="text-3xl font-black text-black uppercase tracking-tight">
            OPENYARD
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/residents" 
              className="text-black hover:text-white hover:bg-black px-5 py-2.5 transition font-black uppercase text-sm tracking-wider border-4 border-transparent hover:border-black"
            >
              BROWSE
            </Link>

            {session?.user ? (
              <>
                {session.user.role === "RESIDENT" && (
                  <Link
                    href="/dashboard/resident"
                    className="text-black hover:text-white hover:bg-black px-5 py-2.5 transition font-black uppercase text-sm tracking-wider border-4 border-transparent hover:border-black"
                  >
                    DASHBOARD
                  </Link>
                )}

                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="text-black hover:text-white hover:bg-black px-5 py-2.5 transition font-black uppercase text-sm tracking-wider border-4 border-transparent hover:border-black"
                  >
                    ADMIN
                  </Link>
                )}

                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-black hover:text-white hover:bg-black px-5 py-2.5 transition font-black uppercase text-sm tracking-wider border-4 border-transparent hover:border-black"
                >
                  SIGN OUT
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/signin" 
                  className="text-black hover:text-white hover:bg-black px-5 py-2.5 transition font-black uppercase text-sm tracking-wider border-4 border-transparent hover:border-black"
                >
                  SIGN IN
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="bg-black text-white px-7 py-2.5 hover:bg-yellow-400 hover:text-black transition font-black uppercase text-sm tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  SIGN UP
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-3 border-4 border-black hover:bg-black hover:text-white transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X size={24} strokeWidth={3} />
            ) : (
              <Menu size={24} strokeWidth={3} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 space-y-4 border-t-4 border-black">
            <Link
              href="/residents"
              className="block text-black hover:bg-black hover:text-white px-4 py-3 transition font-black uppercase text-sm tracking-wider border-4 border-black"
              onClick={() => setMobileMenuOpen(false)}
            >
              BROWSE
            </Link>

            {session?.user ? (
              <>
                {session.user.role === "RESIDENT" && (
                  <Link
                    href="/dashboard/resident"
                    className="block text-black hover:bg-black hover:text-white px-4 py-3 transition font-black uppercase text-sm tracking-wider border-4 border-black"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    DASHBOARD
                  </Link>
                )}

                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="block text-black hover:bg-black hover:text-white px-4 py-3 transition font-black uppercase text-sm tracking-wider border-4 border-black"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    ADMIN
                  </Link>
                )}

                <button
                  onClick={() => {
                    signOut({ callbackUrl: '/' });
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-black hover:bg-black hover:text-white px-4 py-3 transition font-black uppercase text-sm tracking-wider border-4 border-black"
                >
                  SIGN OUT
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="block text-black hover:bg-black hover:text-white px-4 py-3 transition font-black uppercase text-sm tracking-wider border-4 border-black"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  SIGN IN
                </Link>
                <Link
                  href="/auth/signup"
                  className="block bg-black text-white px-4 py-3 hover:bg-yellow-400 hover:text-black transition font-black uppercase text-sm tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  SIGN UP
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
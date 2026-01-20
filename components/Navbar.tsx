"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, User } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="text-2xl font-light text-gray-900">
            Mainyard
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/residents" 
              className="text-gray-600 hover:text-gray-900 transition text-sm"
            >
              Browse
            </Link>

            {session?.user ? (
              <>
                {session.user.role === "RESIDENT" && (
                  <Link
                    href="/dashboard/resident"
                    className="text-gray-600 hover:text-gray-900 transition text-sm"
                  >
                    Dashboard
                  </Link>
                )}

                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="text-gray-600 hover:text-gray-900 transition text-sm"
                  >
                    Admin
                  </Link>
                )}

                <button
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-gray-900 transition text-sm"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/signin" 
                  className="text-gray-600 hover:text-gray-900 transition text-sm"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X size={24} className="text-gray-900" />
            ) : (
              <Menu size={24} className="text-gray-900" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 space-y-4 border-t border-gray-100">
            <Link
              href="/residents"
              className="block text-gray-600 hover:text-gray-900 transition"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse
            </Link>

            {session?.user ? (
              <>
                {session.user.role === "RESIDENT" && (
                  <Link
                    href="/dashboard/resident"
                    className="block text-gray-600 hover:text-gray-900 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}

                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="block text-gray-600 hover:text-gray-900 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}

                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-gray-600 hover:text-gray-900 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="block text-gray-600 hover:text-gray-900 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-800 transition text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
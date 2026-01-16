"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  console.log(session)
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Mainyard
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/residents" className="text-gray-700 hover:text-blue-600">
              Browse Residents
            </Link>

            {session?.user ? (
              <>
                {session.user.role === "RESIDENT" && (
                  <Link
                    href="/dashboard/resident"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Dashboard
                  </Link>
                )}

                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="text-gray-700 hover:text-blue-600"
                  >
                    Admin
                  </Link>
                )}

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{session.user.email}</span>
                  <button
                    onClick={() => signOut()}
                    className="btn-secondary text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="btn-secondary text-sm">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/residents"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Browse Residents
            </Link>

            {session?.user ? (
              <>
                {session.user.role === "RESIDENT" && (
                  <Link
                    href="/dashboard/resident"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>
                )}

                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Admin
                  </Link>
                )}

                <button
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block px-4 py-2 text-blue-600 font-medium"
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

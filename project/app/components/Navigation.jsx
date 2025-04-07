// components/Navigation.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  // Check if user is logged in on component mount
  useEffect(() => {
    // For demo purposes, we'll just set a dummy value
    setIsLoggedIn(false);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const linkItems = [
    {
      href: "/",
      label: "Home",
    },
    {
      href: "/dashboard/cars",
      label: "Browse Cars",
    },
  ];

  const authItems = isLoggedIn
    ? [
        {
          href: "/dashboard/bookings",
          label: "My Bookings",
        },
        {
          href: "/dashboard/messages",
          label: "Messages",
        },
        {
          href: "/dashboard/profile",
          label: "Profile",
        },
      ]
    : [
        {
          href: "/auth/signin",
          label: "Sign In",
        },
        {
          href: "/auth/signup",
          label: "Sign Up",
          variant: "filled",
        },
      ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMenu}
          className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <span className="text-xl">✕</span>
          ) : (
            <span className="text-xl">☰</span>
          )}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-gray-900 bg-opacity-90 backdrop-blur-md h-screen fixed left-0 top-0 z-40 border-r border-gray-800">
        <div className="h-full flex flex-col justify-between p-6">
          <div>
            <Link href="/" className="block mb-10 text-center">
              <h1 className="text-2xl font-bold text-white">DriveShare</h1>
            </Link>
            <nav>
              <ul className="space-y-4">
                {linkItems.map((item) => (
                  <li key={item.href} className="text-center">
                    <Link
                      href={item.href}
                      className={`block px-4 py-2 rounded-lg transition-colors ${
                        pathname === item.href
                          ? "bg-blue-600 text-white"
                          : "text-white hover:bg-gray-800"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <ul className="space-y-4">
              {authItems.map((item) => (
                <li key={item.href} className="text-center">
                  <Link
                    href={item.href}
                    className={`block px-4 py-2 rounded-lg transition-colors ${
                      item.variant === "filled"
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : pathname === item.href
                        ? "bg-blue-600 text-white"
                        : "text-white hover:bg-gray-800"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Slide-in) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed top-0 left-0 z-40 w-64 h-screen bg-gray-900 shadow-lg lg:hidden border-r border-gray-800"
          >
            <div className="h-full flex flex-col justify-between p-6 pt-16">
              <div>
                <Link
                  href="/"
                  className="block mb-10 text-center"
                  onClick={() => setIsOpen(false)}
                >
                  <h1 className="text-2xl font-bold text-white">DriveShare</h1>
                </Link>
                <nav>
                  <ul className="space-y-4">
                    {linkItems.map((item) => (
                      <li key={item.href} className="text-center">
                        <Link
                          href={item.href}
                          className={`block px-4 py-2 rounded-lg transition-colors ${
                            pathname === item.href
                              ? "bg-blue-600 text-white"
                              : "text-white hover:bg-gray-800"
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              <div>
                <ul className="space-y-4">
                  {authItems.map((item) => (
                    <li key={item.href} className="text-center">
                      <Link
                        href={item.href}
                        className={`block px-4 py-2 rounded-lg transition-colors ${
                          item.variant === "filled"
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : pathname === item.href
                            ? "bg-blue-600 text-white"
                            : "text-white hover:bg-gray-800"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay when mobile menu is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

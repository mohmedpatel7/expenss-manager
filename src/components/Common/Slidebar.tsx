"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/Redux/store/store";
import { useRouter } from "next/navigation";
import { FaChevronUp } from "react-icons/fa";
import { useToast } from "../Common/Toast";

const navItems = [
  {
    label: "Dashboard",
    icon: (active: boolean) => (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke={active ? "#2563eb" : "#b0b8c1"}
        strokeWidth="2.2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"
        />
      </svg>
    ),
    href: "#",
  },
  {
    label: "Categories",
    icon: (active: boolean) => (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke={active ? "#2563eb" : "#b0b8c1"}
        strokeWidth="2.2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    ),
    href: "#",
  },
  {
    label: "Expenses",
    icon: (active: boolean) => (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke={active ? "#2563eb" : "#b0b8c1"}
        strokeWidth="2.2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 8v8"
        />
      </svg>
    ),
    href: "#",
  },
  {
    label: "Settings",
    icon: (active: boolean) => (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke={active ? "#2563eb" : "#b0b8c1"}
        strokeWidth="2.2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
      </svg>
    ),
    href: "#",
  },
];

const Slidebar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // For demo, Dashboard is active
  const active = "Dashboard";
  const [showDropup, setShowDropup] = useState(false);
  const dropupRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const { showToast } = useToast();

  // Check login state from Redux and localStorage
  const signinState = useSelector(
    (state: RootState) => state.auth?.signinState
  );
  const signupState = useSelector(
    (state: RootState) => state.auth?.signupState
  );

  useEffect(() => {
    // Check Redux state or localStorage for usertoken
    const token =
      signinState?.usertoken ||
      signupState?.usertoken ||
      (typeof window !== "undefined"
        ? localStorage.getItem("usertoken")
        : null);
    setIsLoggedIn(!!token);
  }, [signinState, signupState]);

  useEffect(() => {
    // Close dropup on outside click
    function handleClickOutside(event: MouseEvent) {
      if (
        dropupRef.current &&
        !dropupRef.current.contains(event.target as Node)
      ) {
        setShowDropup(false);
      }
    }
    if (showDropup) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropup]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md lg:hidden bg-white shadow-md"
        aria-label="Toggle sidebar"
      >
        {open ? (
          <svg
            className="h-6 w-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="h-6 w-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen w-72 bg-white shadow-xl z-40 flex flex-col
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{ minWidth: 270 }}
      >
        {/* Logo and Title */}
        <div className="p-8 border-b border-gray-100 flex items-center gap-3">
          <div className="bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] p-2 rounded-lg">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="7" width="18" height="10" rx="3" fill="#fff" />
              <rect x="7" y="11" width="2" height="2" rx="1" fill="#2563eb" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-black tracking-tight leading-tight">
              Expenss Manager
            </h1>
            <p className="text-xs text-[#83949b] font-medium">
              Manage your expenses easily
            </p>
          </div>
        </div>
        {/* Navigation */}
        <nav className="mt-4 px-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = active === item.label;
            return (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition text-base font-semibold
                  ${
                    isActive
                      ? "bg-[#e0e7ff] text-[#2563eb]"
                      : "text-[#83949b] hover:bg-[#f1f5f9] hover:text-[#2563eb]"
                  }
                `}
                onClick={() => {
                  if (open) setOpen(false);
                }}
              >
                <span className="flex-shrink-0">{item.icon(isActive)}</span>
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
        {/* Auth/User section pinned to bottom */}
        <div className="absolute bottom-6 w-full px-8">
          {isLoggedIn ? (
            <div className="flex items-center gap-3 relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] flex items-center justify-center text-white font-bold text-lg">
                U
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-black truncate">
                  Username
                </div>
                <div className="text-xs text-[#83949b] truncate">
                  user@email.com
                </div>
              </div>
              {/* Dropup toggle button with arrow */}
              <button
                className="ml-2 p-2 rounded-full hover:bg-[#e0e7ff] transition flex items-center justify-center focus:outline-none"
                onClick={() => setShowDropup((prev) => !prev)}
                tabIndex={0}
                aria-haspopup="true"
                aria-expanded={showDropup}
                aria-label="Open user menu"
              >
                <FaChevronUp
                  className={`transition-transform ${
                    showDropup ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              {/* Dropup menu */}
              {showDropup && (
                <div
                  ref={dropupRef}
                  className="absolute bottom-14 right-0 mb-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 z-50 animate-fade-in"
                >
                  {/* Arrow */}
                  <div className="absolute right-4 -top-2 w-4 h-4 overflow-hidden">
                    <div className="w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45 transform origin-bottom-left shadow-md"></div>
                  </div>
                  {/* <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-lg">Profile</button> */}
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-b-lg text-red-600"
                    onClick={() => {
                      localStorage.removeItem("usertoken");
                      window.location.reload();
                      showToast("Sign out success!", "error");
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-3 w-full">
              <button
                className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] text-white font-semibold shadow hover:from-[#1d4ed8] hover:to-[#3b82f6] transition"
                onClick={() => {
                  router.push("/signup");
                  if (open) setOpen(false);
                }}
              >
                Sign Up
              </button>
              <button
                className="flex-1 py-2 px-4 rounded-lg border border-[#2563eb] text-[#2563eb] font-semibold hover:bg-[#e0e7ff] transition"
                onClick={() => {
                  router.push("/signin");
                  if (open) setOpen(false);
                }}
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
      {/* End Sidebar */}
    </>
  );
};

export default Slidebar;

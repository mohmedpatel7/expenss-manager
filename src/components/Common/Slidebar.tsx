"use client";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/Redux/store/store";

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

  return (
    <>
      {/* Toggle Button for Mobile */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow border border-gray-200"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle sidebar"
      >
        <svg
          width="24"
          height="24"
          fill="none"
          stroke="#2563eb"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 6h16M4 12h16M4 18h16"
            stroke="#2563eb"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          z-40 flex flex-col w-72 bg-white shadow-xl
          fixed top-0 left-0 h-screen
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:block
        `}
        style={{ minWidth: 270 }}
      >
        {/* Logo and Title */}
        <div className="flex items-center gap-3 px-8 py-8 border-b border-gray-100 flex-shrink-0">
          <div className="bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] p-2 rounded-lg">
            {/* Simple wallet icon */}
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
        <nav className="flex-1 min-h-0 mt-4 px-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = active === item.label;
              return (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-2 rounded-lg transition
                      text-base font-semibold
                      ${
                        isActive
                          ? "bg-[#e0e7ff] text-[#2563eb]"
                          : "text-[#83949b] hover:bg-[#f1f5f9] hover:text-[#2563eb]"
                      }
                    `}
                  >
                    <span className="flex-shrink-0">{item.icon(isActive)}</span>
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        {/* User section or Auth buttons at bottom */}
        <div className="px-8 py-6 border-t border-gray-100 flex items-center gap-3 justify-between flex-shrink-0">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-3 min-w-0">
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
              </div>
              <button
                className="ml-2 p-1 rounded hover:bg-[#e0e7ff] transition"
                title="Logout"
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="#2563eb"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M17 16l4-4m0 0l-4-4m4 4H7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 12a9 9 0 0118 0"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          ) : (
            <div className="flex gap-3 w-full">
              <button className="flex-1 py-2 px-4 rounded-lg bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] text-white font-semibold shadow hover:from-[#1d4ed8] hover:to-[#3b82f6] transition">
                Sign Up
              </button>
              <button className="flex-1 py-2 px-4 rounded-lg border border-[#2563eb] text-[#2563eb] font-semibold hover:bg-[#e0e7ff] transition">
                Login
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default Slidebar;

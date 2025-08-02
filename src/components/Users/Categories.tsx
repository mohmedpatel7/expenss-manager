"use client";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/Redux/store/store";
import {
  fetchExpenseCategories,
  postExpense,
  deleteExpenseCategory,
} from "@/Redux/Slices/Category";
import { useToast } from "../Common/Toast";
import { useRouter } from "next/navigation";

// Helper to format date
function formatDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Color palette for cards
const colorPalette = [
  "bg-green-100 border-green-400 text-green-700",
  "bg-blue-100 border-blue-400 text-blue-700",
  "bg-pink-100 border-pink-400 text-pink-700",
  "bg-yellow-100 border-yellow-400 text-yellow-700",
  "bg-purple-100 border-purple-400 text-purple-700",
  "bg-orange-100 border-orange-400 text-orange-700",
  "bg-teal-100 border-teal-400 text-teal-700",
  "bg-red-100 border-red-400 text-red-700",
  "bg-indigo-100 border-indigo-400 text-indigo-700",
  "bg-gray-100 border-gray-400 text-gray-700",
];

const Categories: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const [category, setCategory] = useState("");
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { categories, loading, error } = useSelector(
    (state: RootState) => state.category
  );

  // Get usertoken from localStorage
  const usertoken =
    typeof window !== "undefined" ? localStorage.getItem("usertoken") : null;

  // Fetch categories on mount
  useEffect(() => {
    if (usertoken) {
      dispatch(fetchExpenseCategories(usertoken));
    }
  }, [dispatch, usertoken]);

  // Show error toast
  useEffect(() => {
    if (error) showToast(error, "error");
  }, [error, showToast]);

  // Handle category creation
  const handleAddCategory = async () => {
    if (!category.trim() || !usertoken) return;
    try {
      const result = await dispatch(
        postExpense({ title: category.trim(), amount: 1, userToken: usertoken })
      ).unwrap();

      // Only show success toast if API succeeded
      if (result && result.message === "Expense recorded successfully") {
        showToast("Category created!", "success");
        setCategory("");
        dispatch(fetchExpenseCategories(usertoken));
      } else {
        showToast(result?.message || "Could not create category", "error");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Failed to create category", "error");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!usertoken) return;
    setDeletingId(id);
    try {
      await dispatch(
        deleteExpenseCategory({ id, userToken: usertoken })
      ).unwrap();
      showToast("Category deleted!", "success");
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Failed to delete category", "error");
      }
    } finally {
      setDeletingId(null);
      setMenuOpen(null);
    }
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-[#e0e7ff] via-[#f0f6ff] to-[#f8fafc] flex flex-col items-center py-12 px-4 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 mb-10">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          <input
            type="text"
            placeholder="Add new category..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] text-black bg-gray-50 shadow-sm transition"
          />
          <button
            onClick={handleAddCategory}
            disabled={!category.trim()}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] text-white font-semibold shadow transition whitespace-nowrap
              ${
                !category.trim()
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:from-[#1d4ed8] hover:to-[#3b82f6]"
              }`}
          >
            + Create Category
          </button>
        </div>
      </div>
      <div className="w-full max-w-7xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mb-6"></div>
            <span className="text-xl text-blue-700 font-semibold mb-2">
              Loading categories...
            </span>
            <span className="text-gray-500">
              Fetching your categories and latest data.
            </span>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <span className="text-2xl text-[#2563eb] font-bold mb-2">
              No categories found
            </span>
            <span className="text-gray-500">
              Start by creating a new category above.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {categories.map((cat, idx) => {
              const color = colorPalette[idx % colorPalette.length];
              return (
                <div
                  key={cat._id}
                  className={`border-l-4 rounded-xl shadow p-6 flex flex-col items-center relative ${color} animate-fade-in cursor-pointer`}
                  style={{ animationDelay: `${idx * 0.07 + 0.1}s` }}
                  onClick={() => router.push(`/categories/${cat._id}`)}
                  role="button"
                  tabIndex={0}
                  ref={menuOpen === cat._id ? menuRef : null}
                >
                  {/* Three-dot menu */}
                  <button
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(menuOpen === cat._id ? null : cat._id);
                    }}
                    aria-label="Open menu"
                  >
                    <span className="text-xl">&#8942;</span>
                  </button>
                  {menuOpen === cat._id && (
                    <div className="absolute top-8 right-2 bg-white border rounded shadow-lg z-20 min-w-[120px]">
                      <button
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 disabled:opacity-60"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(cat._id);
                        }}
                        disabled={deletingId === cat._id}
                      >
                        {deletingId === cat._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                  <span className="text-lg font-bold mb-1">{cat.title}</span>
                  <span className="text-xs text-gray-500 mt-1">
                    Created:{" "}
                    {cat.expenses.length > 0
                      ? formatDate(cat.expenses[0].date)
                      : "-"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Custom fade-in animation */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease both;
        }
      `}</style>
    </div>
  );
};

export default Categories;

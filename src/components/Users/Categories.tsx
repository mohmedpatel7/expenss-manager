"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/Redux/store/store";
import { fetchExpenseCategories, postExpense } from "@/Redux/Slices/Category";
import { useToast } from "../Common/Toast";

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
      await dispatch(
        postExpense({ title: category.trim(), amount: 1, userToken: usertoken })
      ).unwrap();
      showToast("Category created!", "success");
      setCategory("");
      dispatch(fetchExpenseCategories(usertoken));
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("Failed to create category", "error");
      }
    }
  };

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
                  className={`border-l-4 rounded-xl shadow p-6 flex flex-col items-center ${color} animate-fade-in`}
                  style={{ animationDelay: `${idx * 0.07 + 0.1}s` }}
                >
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

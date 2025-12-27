"use client";
import React, { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "next/navigation";
import type { RootState, AppDispatch } from "@/Redux/store/store";
import CateAmountUpdate from "./CateAmountUpdate";
import { useToast } from "../Common/Toast";
import { fetchExpenseCategoryById } from "@/Redux/Slices/Category";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function formatDateTime(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;
}

const CategoriesIndex: React.FC = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  const usertoken =
    typeof window !== "undefined" ? localStorage.getItem("usertoken") : null;

  const { loading, error, expense } = useSelector(
    (state: RootState) => state.category
  );

  useEffect(() => {
    const fetchData = async () => {
      if (id && usertoken) {
        await dispatch(
          fetchExpenseCategoryById({ id: id as string, userToken: usertoken })
        );
        setInitialFetchDone(true);
      }
    };
    fetchData();
  }, [id, usertoken, dispatch]);

  const category = expense && expense._id === id ? expense : null;

  const totalDebited = useMemo(() => {
    if (!category) return 0;
    return category.expenses
      .filter((e) => e.type === "debit")
      .reduce((sum, e) => sum + e.amount, 0);
  }, [category]);

  useEffect(() => {
    if (error) showToast(error, "error");
  }, [error, showToast]);

  const handleModalClose = () => {
    setModalOpen(false);
    if (usertoken && id) {
      dispatch(
        fetchExpenseCategoryById({ id: id as string, userToken: usertoken })
      );
    }
  };

  if (!initialFetchDone || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mb-6"></div>
        <span className="text-xl text-blue-700 font-semibold mb-2">
          Loading category...
        </span>
        <span className="text-gray-500">
          Fetching your category and latest data.
        </span>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <span className="text-xl text-red-600 font-bold">
          Category not found
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-[#e0e7ff] via-[#f0f6ff] to-[#f8fafc] flex flex-col items-center py-10 px-4 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-extrabold text-[#2563eb] mb-1">
            {category.title}
          </h2>
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-mono">
            <span>
              Created On: {new Date(category.createdAt).toLocaleString()}
            </span>
            <span>
              Last Transaction: {new Date(category.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg text-gray-500">Total Debited</p>
          <p className="text-4xl font-extrabold text-red-500">
            ₹{totalDebited.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="w-full max-w-5xl mb-10">
        <h3 className="text-2xl font-bold text-[#2563eb] mb-4">Transactions</h3>
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#2563eb]/40 scrollbar-track-[#e0e7ff] rounded-xl shadow-lg bg-gray-50">
          {category.expenses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No transactions yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 min-w-[500px] animate-fade-in-up">
              {category.expenses
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                )
                .map((txn, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between px-6 py-4 transition-transform duration-300 hover:scale-[1.02] hover:bg-[#e0e7ff]/60"
                    style={{
                      animation: `fadeInUp 0.5s ease ${idx * 0.08 + 0.1}s both`,
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`inline-block w-3 h-3 rounded-full ${
                          txn.type === "credit" ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                      <div className="flex flex-col">
                        <span className="capitalize font-semibold text-gray-700 text-base">
                          {txn.type}
                        </span>
                        {txn.description && (
                          <span className="text-gray-500 text-sm">
                            {txn.description}
                          </span>
                        )}
                      </div>
                      <span className="text-gray-400 text-sm ml-2 whitespace-nowrap">
                        {formatDateTime(txn.date)}
                      </span>
                    </div>
                    <div className="flex flex-col items-end min-w-[120px]">
                      <span
                        className={`font-bold text-lg ${
                          txn.type === "credit"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {txn.type === "credit" ? "+" : "-"}₹
                        {txn.amount.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 mt-1 font-mono">
                        Bal: ₹{txn.currentAmount.toLocaleString()}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>

      {/* Graphs Section */}
      {category.expenses.length > 0 && (
        <div className="w-full max-w-5xl mb-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Line Chart: Balance Over Time */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h4 className="text-lg font-bold mb-4 text-[#2563eb]">
              Balance Over Time
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={category.expenses
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(a.date).getTime() - new Date(b.date).getTime()
                  )}
              >
                <XAxis
                  dataKey="date"
                  tickFormatter={(d) => new Date(d).toLocaleDateString()}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip
                  labelFormatter={(d) => new Date(d).toLocaleString()}
                  formatter={(v: number) => `₹${v.toLocaleString()}`}
                />
                <Line
                  type="monotone"
                  dataKey="currentAmount"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* Pie Chart: Debit vs Credit */}
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center">
            <h4 className="text-lg font-bold mb-4 text-[#2563eb]">
              Debit vs Credit
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    {
                      name: "Debit",
                      value: category.expenses
                        .filter((e) => e.type === "debit")
                        .reduce((sum, e) => sum + e.amount, 0),
                    },
                    {
                      name: "Credit",
                      value: category.expenses
                        .filter((e) => e.type === "credit")
                        .reduce((sum, e) => sum + e.amount, 0),
                    },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  <Cell key="debit" fill="#ef4444" />
                  <Cell key="credit" fill="#22c55e" />
                </Pie>
                <Legend />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <button
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl hover:scale-110 transition-transform duration-200"
        onClick={() => setModalOpen(true)}
        aria-label="Open debit modal"
      >
        -
      </button>

      <CateAmountUpdate
        open={modalOpen}
        onClose={handleModalClose}
        categoryId={category._id}
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .scrollbar-thin::-webkit-scrollbar {
          height: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #2563eb66;
          border-radius: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #e0e7ff;
        }
      `}</style>
    </div>
  );
};

export default CategoriesIndex;

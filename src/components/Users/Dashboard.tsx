"use client";
import React, { useState, useEffect, useMemo } from "react";
import AmountUpdateModal from "./AmountUpdate";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { fetchUserProfile } from "@/Redux/Slices/AuthSlices";
import { fetchCreditAccount } from "@/Redux/Slices/Amount";
import type { AppDispatch } from "@/Redux/store/store";
import type { RootState } from "@/Redux/store/store";
import Image from "next/image";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Define a type for userProfile
interface UserProfile {
  name: string;
  email: string;
  pic?: string;
  dob?: string;
  creadit?: { currentCredit: number } | null;
}

// Transaction type for credit account history
interface Transaction {
  type: "credit" | "debit";
  amount: number;
  date: string;
  currentAmount: number;
}

const UserInfo = React.memo(({ userProfile }: { userProfile: UserProfile }) => (
  <div className="flex items-center gap-6 w-full md:w-auto">
    <Image
      src={userProfile.pic || "/profile.jpg"}
      alt={userProfile.name}
      width={96}
      height={96}
      className="w-24 h-24 rounded-full border-4 border-[#2563eb] shadow-lg object-cover"
      priority
    />
    <div>
      <h2 className="text-3xl font-extrabold text-[#2563eb] mb-1">
        {userProfile.name}
      </h2>
      <p className="text-gray-600 font-medium text-lg">{userProfile.email}</p>
      <p className="text-gray-500 text-base">
        DOB:{" "}
        {userProfile.dob
          ? new Date(userProfile.dob).toLocaleDateString()
          : "N/A"}
      </p>
    </div>
  </div>
));
UserInfo.displayName = "UserInfo";

const AmountSection = React.memo(
  ({ currentAmount }: { currentAmount: number }) => {
    const isLow = currentAmount < 1000;
    return (
      <div className="flex flex-col items-center md:items-end w-full md:w-auto">
        <span className="text-lg text-gray-500 font-medium">
          Current Amount
        </span>
        <span
          className={`text-4xl font-extrabold mt-1 ${
            isLow ? "text-red-500" : "text-green-600"
          }`}
        >
          ₹{currentAmount?.toLocaleString() || 0}
        </span>
      </div>
    );
  }
);
AmountSection.displayName = "AmountSection";

const Transactions = React.memo(
  ({ transactions }: { transactions: Transaction[] }) => {
    const [visibleCount, setVisibleCount] = React.useState(10);
    const visibleTransactions = useMemo(
      () => transactions.slice(0, visibleCount),
      [transactions, visibleCount]
    );
    return (
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#2563eb]/40 scrollbar-track-[#e0e7ff] rounded-xl shadow-lg bg-gray-50">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No transactions yet.
          </div>
        ) : (
          <>
            <ul className="divide-y divide-gray-200 min-w-[500px] animate-fade-in-up">
              {visibleTransactions.map((txn: Transaction, idx: number) => (
                <li
                  key={idx}
                  className="flex items-center justify-between px-6 py-4 transition-transform duration-300 hover:scale-[1.02] hover:bg-[#e0e7ff]/60 font-sans"
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
                    <span className="capitalize font-semibold text-gray-700 text-base">
                      {txn.type}
                    </span>
                    <span className="text-gray-400 text-sm ml-2 whitespace-nowrap">
                      {new Date(txn.date).toLocaleDateString()}{" "}
                      {new Date(txn.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
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
            {visibleCount < transactions.length && (
              <div className="flex justify-center py-4">
                <button
                  className="px-6 py-2 rounded-lg bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] text-white font-semibold shadow hover:from-[#1d4ed8] hover:to-[#3b82f6] transition"
                  onClick={() => setVisibleCount((c) => c + 10)}
                >
                  Show More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
);
Transactions.displayName = "Transactions";

const Dashboard: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "credit" | "debit">(
    "all"
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const dispatch = useDispatch<AppDispatch>();
  const userProfile = useSelector(
    (state: RootState) => state.auth.userProfile,
    shallowEqual
  );
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);
  const error = useSelector((state: RootState) => state.auth.error);
  const creditAccount = useSelector(
    (state: RootState) => state.amountSlice.account
  ) as { currentCredit: number; history: Transaction[] } | null;

  // Check for usertoken in localStorage
  let isUser = false;
  let usertoken: string | null = null;
  if (typeof window !== "undefined") {
    usertoken = localStorage.getItem("usertoken");
    isUser = !!usertoken;
  }

  // Filter transactions based on filterType and date range
  const filteredTransactions = useMemo(() => {
    return (creditAccount?.history || []).filter((txn) => {
      // Filter by type
      if (filterType !== "all" && txn.type !== filterType) return false;
      // Filter by date
      const txnDate = new Date(txn.date);
      if (startDate && txnDate < new Date(startDate)) return false;
      if (endDate && txnDate > new Date(endDate)) return false;
      return true;
    });
  }, [creditAccount?.history, filterType, startDate, endDate]);

  // Prepare data for the balance-over-time line chart
  const chartData = useMemo(() => {
    if (!filteredTransactions.length) return null;
    // Sort by date ascending
    const sorted = [...filteredTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    // Project blue color
    const lineColor = "#2563eb";
    const fillColor = "rgba(37,99,235,0.12)"; // blue, very light
    const pointBg = "#2563eb";
    const pointHover = "#1d4ed8"; // darker blue
    return {
      labels: sorted.map((txn) =>
        new Date(txn.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })
      ),
      datasets: [
        {
          label: "Balance",
          data: sorted.map((txn) => txn.currentAmount),
          borderColor: lineColor,
          backgroundColor: fillColor,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: pointBg,
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: pointHover,
          pointHoverBorderColor: lineColor,
          borderWidth: 3,
        },
      ],
    };
  }, [filteredTransactions]);

  // Info card calculations
  const totalCredits = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === "credit")
        .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );
  const totalDebits = useMemo(
    () =>
      filteredTransactions
        .filter((t) => t.type === "debit")
        .reduce((sum, t) => sum + t.amount, 0),
    [filteredTransactions]
  );
  const numTransactions = filteredTransactions.length;
  const biggestCredit = useMemo(
    () =>
      Math.max(
        0,
        ...filteredTransactions
          .filter((t) => t.type === "credit")
          .map((t) => t.amount)
      ),
    [filteredTransactions]
  );
  const biggestDebit = useMemo(
    () =>
      Math.max(
        0,
        ...filteredTransactions
          .filter((t) => t.type === "debit")
          .map((t) => t.amount)
      ),
    [filteredTransactions]
  );

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: "#2563eb",
          font: { weight: "bold" as const, size: 14 },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "#fff",
        titleColor: "#2563eb",
        bodyColor: "#333",
        borderColor: "#2563eb",
        borderWidth: 1,
        titleFont: { weight: "bold" as const, size: 16 },
        bodyFont: { size: 14 },
      },
    },
    scales: {
      x: {
        ticks: { color: "#2563eb", font: { weight: "bold" as const } },
        grid: { color: "rgba(37,99,235,0.08)" },
      },
      y: {
        ticks: { color: "#2563eb", font: { weight: "bold" as const } },
        grid: { color: "rgba(37,99,235,0.08)" },
      },
    },
  };

  useEffect(() => {
    if (isUser && usertoken) {
      dispatch(fetchUserProfile(usertoken));
      dispatch(fetchCreditAccount(usertoken));
    }
  }, [dispatch, isUser, usertoken]);

  if (!isUser) return null;

  // Show loading or error states
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-tr from-[#e0e7ff] via-[#f0f6ff] to-[#f8fafc]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mb-6"></div>
          <span className="text-xl text-blue-700 font-semibold mb-2">
            Loading your dashboard...
          </span>
          <span className="text-gray-500">
            Fetching your profile and latest data.
          </span>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <span className="text-lg text-red-500">{error}</span>
      </div>
    );
  }
  if (!userProfile) return null;

  return (
    <>
      <div className="min-h-screen w-full bg-gradient-to-tr from-[#e0e7ff] via-[#f0f6ff] to-[#f8fafc] flex flex-col items-center justify-start overflow-x-hidden font-sans">
        {/* Top section: User info and current amount */}
        <div className="w-full max-w-5xl mt-10 px-4 md:px-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10 bg-white rounded-2xl shadow-xl p-8">
            <UserInfo userProfile={userProfile} />
            <AmountSection currentAmount={creditAccount?.currentCredit || 0} />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="w-full max-w-5xl px-4 md:px-0 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-lg font-semibold text-black mb-4">
              Filter Transactions
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
              {/* Filter by Type */}
              <div>
                <label
                  htmlFor="filterType"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Type
                </label>
                <select
                  id="filterType"
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(e.target.value as "all" | "credit" | "debit")
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition text-black"
                >
                  <option value="all">All</option>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </select>
              </div>

              {/* Filter by Start Date */}
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-black mb-1"
                >
                  From
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition text-black"
                />
              </div>

              {/* Filter by End Date */}
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-black mb-1"
                >
                  To
                </label>
                <input
                  id="endDate"
                  type="date"
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] transition text-black"
                />
              </div>

              {/* Clear Button */}
              {(startDate || endDate || filterType !== "all") && (
                <div className="flex items-end h-full">
                  <button
                    className="w-full px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-black font-medium transition"
                    onClick={() => {
                      setFilterType("all");
                      setStartDate("");
                      setEndDate("");
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Latest Transactions with scroll animation */}
        <div className="w-full max-w-5xl px-4 md:px-0 mb-10">
          <h3 className="text-2xl font-bold text-[#2563eb] mb-4 font-sans">
            Latest Transactions
          </h3>
          <Transactions transactions={filteredTransactions} />
        </div>

        {/* Graph Placeholder */}
        <div className="w-full max-w-5xl px-4 md:px-0 mb-20">
          <div className="bg-white rounded-2xl p-8 shadow flex flex-col items-center justify-center min-h-[240px]">
            <span className="text-[#2563eb] text-2xl font-bold mb-3 font-sans">
              Spending & Credit Overview
            </span>
            <div className="w-full h-64 flex items-center justify-center">
              {chartData ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <span className="text-[#2563eb]/80 italic text-lg font-sans">
                  No transaction data to display graph.
                </span>
              )}
            </div>
          </div>
          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-8">
            <div className="bg-white border-l-4 border-green-500 rounded-xl shadow p-5 flex flex-col items-center">
              <span className="text-sm text-gray-500 font-medium mb-1">
                Total Credits
              </span>
              <span className="text-2xl font-bold text-green-600">
                ₹{totalCredits.toLocaleString()}
              </span>
            </div>
            <div className="bg-white border-l-4 border-red-500 rounded-xl shadow p-5 flex flex-col items-center">
              <span className="text-sm text-gray-500 font-medium mb-1">
                Total Debits
              </span>
              <span className="text-2xl font-bold text-red-500">
                ₹{totalDebits.toLocaleString()}
              </span>
            </div>
            <div className="bg-white border-l-4 border-[#2563eb] rounded-xl shadow p-5 flex flex-col items-center">
              <span className="text-sm text-gray-500 font-medium mb-1">
                Transactions
              </span>
              <span className="text-2xl font-bold text-[#2563eb]">
                {numTransactions}
              </span>
            </div>
            <div className="bg-white border-l-4 border-green-400 rounded-xl shadow p-5 flex flex-col items-center">
              <span className="text-sm text-gray-500 font-medium mb-1">
                Biggest Credit
              </span>
              <span className="text-2xl font-bold text-green-600">
                ₹{biggestCredit.toLocaleString()}
              </span>
            </div>
            <div className="bg-white border-l-4 border-red-400 rounded-xl shadow p-5 flex flex-col items-center">
              <span className="text-sm text-gray-500 font-medium mb-1">
                Biggest Debit
              </span>
              <span className="text-2xl font-bold text-red-500">
                ₹{biggestDebit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        {/* Smart Suggestion/Info Section */}
        <div className="w-full flex flex-col items-center mt-8">
          {(() => {
            if ((creditAccount?.currentCredit || 0) < 1000) {
              return (
                <div className="bg-red-50 border-l-4 border-red-400 rounded-xl shadow p-5 w-full max-w-2xl flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <span className="text-red-600 font-bold">
                      Low Balance Alert:
                    </span>
                    <span className="ml-2 text-gray-700">
                      Your balance is running low. Consider adding funds or
                      reducing expenses.
                    </span>
                  </div>
                </div>
              );
            }
            if (totalDebits > totalCredits && totalDebits > 0) {
              return (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-xl shadow p-5 w-full max-w-2xl flex items-center gap-3">
                  <span className="text-2xl">💸</span>
                  <div>
                    <span className="text-yellow-700 font-bold">
                      High Spending:
                    </span>
                    <span className="ml-2 text-gray-700">
                      You&apos;ve spent more than you&apos;ve credited recently.
                      Review your expenses for savings opportunities.
                    </span>
                  </div>
                </div>
              );
            }
            if (totalCredits > 0 && totalDebits === 0) {
              return (
                <div className="bg-blue-50 border-l-4 border-blue-400 rounded-xl shadow p-5 w-full max-w-2xl flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <span className="text-blue-700 font-bold">
                      Great Start!
                    </span>
                    <span className="ml-2 text-gray-700">
                      You&apos;ve credited your account but haven&apos;t spent
                      anything yet. Keep it up!
                    </span>
                  </div>
                </div>
              );
            }
            if (
              totalCredits > 0 &&
              totalDebits > 0 &&
              totalCredits > totalDebits
            ) {
              return (
                <div className="bg-green-50 border-l-4 border-green-400 rounded-xl shadow p-5 w-full max-w-2xl flex items-center gap-3">
                  <span className="text-2xl">🌱</span>
                  <div>
                    <span className="text-green-700 font-bold">Good Job!</span>
                    <span className="ml-2 text-gray-700">
                      You&apos;re saving more than you&apos;re spending. Keep
                      growing your balance!
                    </span>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* Floating Action Button for Amount Update */}
        <button
          className="fixed bottom-8 right-8 z-50 bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl hover:scale-110 transition-transform duration-200"
          onClick={() => setModalOpen(true)}
          aria-label="Open amount update modal"
        >
          +
        </button>

        {/* Amount Update Modal */}
        <AmountUpdateModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />

        {/* Custom scroll animation keyframes */}
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
    </>
  );
};

export default Dashboard;

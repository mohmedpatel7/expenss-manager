"use client";
import React, { useState, useEffect, useMemo } from "react";
import AmountUpdateModal from "./AmountUpdate";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { fetchUserProfile } from "@/Redux/Slices/AuthSlices";
import { fetchCreditAccount } from "@/Redux/Slices/Amount";
import type { AppDispatch } from "@/Redux/store/store";
import type { RootState } from "@/Redux/store/store";
import Image from "next/image";

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
  ({
    currentAmount,
    onUpdate,
  }: {
    currentAmount: number;
    onUpdate: () => void;
  }) => (
    <div className="flex flex-col items-center md:items-end w-full md:w-auto">
      <span className="text-lg text-gray-500 font-medium">Current Amount</span>
      <span className="text-4xl font-extrabold text-green-600 mt-1">
        ₹{currentAmount?.toLocaleString() || 0}
      </span>
      {/* <button
        className="mt-4 px-6 py-2 rounded-lg bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] text-white font-semibold shadow hover:from-[#1d4ed8] hover:to-[#3b82f6] transition"
        onClick={onUpdate}
      >
        Update Amount
      </button>  */}
    </div>
  )
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
            <AmountSection
              currentAmount={creditAccount?.currentCredit || 0}
              onUpdate={() => setModalOpen(true)}
            />
          </div>
        </div>

        {/* Latest Transactions with scroll animation */}
        <div className="w-full max-w-5xl px-4 md:px-0 mb-10">
          <h3 className="text-2xl font-bold text-[#2563eb] mb-4 font-sans">
            Latest Transactions
          </h3>
          <Transactions transactions={creditAccount?.history || []} />
        </div>

        {/* Graph Placeholder */}
        <div className="w-full max-w-5xl px-4 md:px-0 mb-20">
          <div className="bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] rounded-2xl p-8 shadow flex flex-col items-center justify-center min-h-[240px]">
            <span className="text-white text-2xl font-bold mb-3 font-sans">
              Spending & Credit Overview
            </span>
            <div className="w-full h-36 flex items-center justify-center">
              {/* Replace this with a real chart/graph later */}
              <span className="text-white/80 italic text-lg font-sans">
                [Graph will appear here]
              </span>
            </div>
          </div>
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

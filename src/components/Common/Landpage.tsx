"use client";
import React from "react";
import { useRouter } from "next/navigation";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const pieData = [
  { name: "Food", value: 400 },
  { name: "Transport", value: 300 },
  { name: "Shopping", value: 200 },
  { name: "Bills", value: 100 },
  { name: "Other", value: 150 },
];
const COLORS = ["#2563eb", "#60a5fa", "#a5b4fc", "#38bdf8", "#818cf8"];

const lineData = [
  { month: "Jan", Expense: 400 },
  { month: "Feb", Expense: 300 },
  { month: "Mar", Expense: 500 },
  { month: "Apr", Expense: 200 },
  { month: "May", Expense: 350 },
  { month: "Jun", Expense: 420 },
];

const features = [
  {
    title: "Track Expenses",
    desc: "Easily log and categorize your daily expenses for better financial control.",
    icon: (
      <svg
        className="w-8 h-8 text-[#2563eb]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    title: "Visualize Spending",
    desc: "Get insights with beautiful charts and graphs to understand your spending habits.",
    icon: (
      <svg
        className="w-8 h-8 text-[#2563eb]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11 17a2.5 2.5 0 005 0V7a2.5 2.5 0 00-5 0v10z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 17a2.5 2.5 0 005 0V7a2.5 2.5 0 00-5 0v10z"
        />
      </svg>
    ),
  },
  {
    title: "Manage Categories",
    desc: "Organize your expenses by custom categories for detailed tracking.",
    icon: (
      <svg
        className="w-8 h-8 text-[#2563eb]"
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
    ),
  },
  {
    title: "Secure & Private",
    desc: "Your data is protected with industry-standard security and privacy.",
    icon: (
      <svg
        className="w-8 h-8 text-[#2563eb]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 11c0-1.657-1.343-3-3-3s-3 1.343-3 3v2a3 3 0 006 0v-2z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 11V9a5 5 0 00-10 0v2"
        />
      </svg>
    ),
  },
];

const LandPage: React.FC = () => {
  const router = useRouter();

  const isUser = localStorage.getItem("usertoken");

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#e0e7ff] via-[#f0f6ff] to-[#f8fafc] text-gray-900">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-20 flex flex-col items-center text-center">
        <div className="bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] p-4 rounded-full mb-6 shadow-lg">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
            <rect x="3" y="7" width="18" height="10" rx="3" fill="#fff" />
            <rect x="7" y="11" width="2" height="2" rx="1" fill="#2563eb" />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#2563eb]">
          Expenss Manager
        </h1>
        <p className="text-lg md:text-xl mb-6 max-w-2xl text-gray-700">
          Take control of your finances. Track, analyze, and optimize your
          spending with beautiful charts and powerful tools.
        </p>
        {!isUser && (
          <button
            className="inline-block px-8 py-3 rounded-lg bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] text-white font-semibold shadow hover:from-[#1d4ed8] hover:to-[#3b82f6] transition text-lg"
            onClick={() => router.push("/signin")}
          >
            Get Started
          </button>
        )}
      </section>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-white rounded-xl shadow p-6 flex flex-col items-center text-center"
          >
            {f.icon}
            <h3 className="mt-4 text-xl font-bold text-[#2563eb]">{f.title}</h3>
            <p className="mt-2 text-gray-600">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Graphs Section */}
      <section className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4 text-[#2563eb]">
            Expense Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold mb-4 text-[#2563eb]">
            Monthly Spending Trend
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={lineData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="Expense"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 5, fill: "#60a5fa" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* About/Purpose Section */}
      <section className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4 text-[#2563eb]">
          Why Expenss Manager?
        </h2>
        <p className="text-gray-700 text-lg">
          Expenss Manager is designed to help you understand and optimize your
          spending habits. With intuitive tools, insightful analytics, and a
          focus on privacy, you can confidently manage your finances and achieve
          your goals. Start your journey to financial wellness today!
        </p>
      </section>
    </div>
  );
};

export default LandPage;

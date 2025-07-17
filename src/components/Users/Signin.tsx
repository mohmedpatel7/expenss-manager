"use client";
import React, { useState } from "react";
import { SigninUser } from "@/Redux/Slices/AuthSlices";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/Redux/store/store";
import { useToast } from "../Common/Toast";

const Signin: React.FC = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const dispatch: AppDispatch = useDispatch();

  const { showToast } = useToast();

  const isUser = localStorage.getItem("usertoken");

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.email) newErrors.email = "Email is required";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      newErrors.email = "Invalid email address";
    if (!form.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (validate()) {
      setLoading(true);
      try {
        const result = await dispatch(
          SigninUser({ email: form.email, password: form.password })
        ).unwrap();
        setForm({ email: "", password: "" });
        setLoading(false);
        if (result?.message) showToast(result.message || "", "success");
        else showToast("Signin successful!", "success");
        // Optionally redirect or reload here
        // window.location.href = "/dashboard";
      } catch (err: unknown) {
        const errorMsg =
          (err as { message?: string })?.message || "Signin failed";
        setApiError(errorMsg);
        setLoading(false);
        if ((err as { message?: string })?.message)
          showToast((err as { message?: string }).message || "", "error");
      }
    }
  };

  return (
    <>
      <div className="min-h-screen w-full bg-gradient-to-tr from-[#e0e7ff] via-[#f0f6ff] to-[#f8fafc] flex flex-col items-center justify-center py-12">
        {!isUser && (
          <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg text-gray-900 dark:text-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-center text-[#2563eb] dark:text-[#60a5fa]">
              Sign In
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">
                  Email
                </label>
                <input
                  type="email"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] border-gray-300 text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:placeholder-gray-400 ${
                    errors.email
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  }`}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoFocus
                />
                {errors.email && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200 mt-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] border-gray-300 text-gray-900 placeholder-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:placeholder-gray-400 ${
                      errors.password
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-300 dark:border-gray-700"
                    }`}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <span
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 dark:text-gray-300"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <FaEye /> : <FaEyeSlash />}
                  </span>
                </div>
                {errors.password && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {errors.password}
                  </p>
                )}
                {apiError && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {apiError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full mt-6 py-2 rounded-lg bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] text-white font-semibold shadow hover:from-[#1d4ed8] hover:to-[#3b82f6] transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default Signin;

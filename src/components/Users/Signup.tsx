"use client";
import React, { useState, ChangeEvent } from "react";
import { SendOtp, SignupUser } from "@/Redux/Slices/AuthSlices";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/Redux/store/store";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useToast } from "../Common/Toast";

const Signup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    otp: ["", "", "", ""],
    name: "",
    dob: "",
    password: "",
    profilePic: null as string | null,
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [otpResent, setOtpResent] = useState<string | null>(null);
  const [finalLoading, setFinalLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch: AppDispatch = useDispatch();
  const authError = useSelector((state: RootState) => state.auth.error);
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);

  const { showToast } = useToast();

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...form.otp];
    newOtp[index] = value;
    setForm({ ...form, otp: newOtp });
    if (value && index < 3) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) (next as HTMLInputElement).focus();
    }
  };

  // Handle profile pic preview
  const handleProfilePic = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setForm({ ...form, profilePic: ev.target?.result as string });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handlePrev = () => {
    setDirection("left");
    setStep((s) => s - 1);
  };

  // Animation classes
  const getAnimationClass = () => {
    return direction === "right"
      ? "animate-slide-in-left"
      : "animate-slide-in-right";
  };

  // Validation for each step
  const validateStep = () => {
    const newErrors: { [key: string]: string } = {};
    if (step === 1) {
      if (!form.email) newErrors.email = "Email is required";
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
        newErrors.email = "Invalid email address";
      if (!form.name) newErrors.name = "Name is required";
      if (!form.dob) newErrors.dob = "Date of birth is required";
      if (!form.password) newErrors.password = "Password is required";
      else if (form.password.length < 8)
        newErrors.password = "Password must be at least 8 characters";
      if (!confirmPassword)
        newErrors.confirmPassword = "Confirm password is required";
      if (form.password && confirmPassword && form.password !== confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    } else if (step === 2) {
      if (form.otp.some((d) => !d)) newErrors.otp = "All OTP fields required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 1: Validate and send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpResent(null);
    if (!validateStep()) return;
    try {
      const result = await dispatch(SendOtp({ email: form.email })).unwrap();
      setDirection("right");
      setStep(2);
      if (result?.message) showToast(result.message || "", "success");
    } catch (err: unknown) {
      if ((err as { message?: string })?.message)
        showToast((err as { message?: string }).message || "", "error");
    }
  };

  // Step 2: Validate OTP and submit all fields
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFinalLoading(true);
    if (!validateStep()) {
      setFinalLoading(false);
      return;
    }
    try {
      const result = await dispatch(
        SignupUser({
          name: form.name,
          email: form.email,
          otp: form.otp.join(""),
          dob: form.dob,
          password: form.password,
          picBase64: form.profilePic || undefined,
        })
      ).unwrap();
      setForm({
        email: "",
        otp: ["", "", "", ""],
        name: "",
        dob: "",
        password: "",
        profilePic: null,
      });
      setConfirmPassword("");
      setErrors({});
      if (result?.message) showToast(result.message || "", "success");
      else showToast("Signup successful! You can now log in.", "success");
    } catch (err: unknown) {
      if ((err as { message?: string })?.message)
        showToast((err as { message?: string }).message || "", "error");
    } finally {
      setFinalLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    setOtpResent(null);
    try {
      const result = await dispatch(SendOtp({ email: form.email })).unwrap();
      setOtpResent("OTP resent to your email.");
      if (result?.message) showToast(result.message || "", "success");
    } catch (err: unknown) {
      if ((err as { message?: string })?.message)
        showToast((err as { message?: string }).message || "", "error");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-12 rounded-xl shadow-lg overflow-hidden">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#2563eb]">
        Sign Up
      </h2>
      <form autoComplete="off">
        <div
          key={step}
          className={`transition-all duration-500 ${getAnimationClass()}`}
        >
          {step === 1 && (
            <div>
              {/* First row: Name and Email side by side, stack on mobile */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <label className="block mb-2 font-medium">Name</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block mb-2 font-medium">Email</label>
                  <input
                    type="email"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
              {/* Second row: Date of Birth */}
              <label className="block mb-2 font-medium">Date of Birth</label>
              <input
                type="date"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] ${
                  errors.dob ? "border-red-500" : "border-gray-300"
                }`}
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
              />
              {errors.dob && (
                <p className="text-red-500 text-sm mt-1">{errors.dob}</p>
              )}
              {/* Third row: Password and Confirm Password side by side, stack on mobile */}
              <div className="flex flex-col md:flex-row gap-4 mt-4 mb-4">
                <div className="flex-1">
                  <label className="block mb-2 font-medium">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                    />
                    <span
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block mb-2 font-medium">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <span
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
              {/* Profile Pic upload and preview, responsive image */}
              <div className="flex flex-col items-start mb-4">
                <label className="block mb-2 font-medium">Profile Pic</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full"
                  onChange={handleProfilePic}
                />
                {form.profilePic && (
                  <div className="mt-2 flex justify-center">
                    <img
                      src={form.profilePic}
                      alt="Profile Preview"
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border border-gray-200"
                    />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                className="w-full mt-6 py-2 rounded-lg bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] text-white font-semibold shadow hover:from-[#1d4ed8] hover:to-[#3b82f6] transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Signing Up..." : "Sign Up"}
              </button>
            </div>
          )}
          {step === 2 && (
            <div>
              <label className="block mb-2 font-medium">Enter OTP</label>
              <div className="flex gap-2 mb-2">
                {form.otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={`w-12 h-12 text-center text-xl border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] ${
                      errors.otp ? "border-red-500" : "border-gray-300"
                    }`}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                  />
                ))}
              </div>
              {(errors.otp || authError) && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.otp || authError}
                </p>
              )}
              {otpResent && (
                <p className="text-green-600 text-sm mt-1">{otpResent}</p>
              )}
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2 rounded-lg border border-[#2563eb] text-[#2563eb] font-semibold hover:bg-[#e0e7ff] transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2 rounded-lg bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] text-white font-semibold shadow hover:from-[#1d4ed8] hover:to-[#3b82f6] transition disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={finalLoading}
                >
                  {finalLoading ? "Submiting.." : "Verify & Complete Signup"}
                </button>
              </div>
              <button
                type="button"
                onClick={handleResendOtp}
                className="w-full mt-4 py-2 rounded-lg border border-[#2563eb] text-[#2563eb] font-semibold hover:bg-[#e0e7ff] transition"
              >
                Resend OTP
              </button>
            </div>
          )}
        </div>
        {/* Removed the success message below */}
      </form>
    </div>
  );
};

export default Signup;

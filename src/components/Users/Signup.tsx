"use client";
import React, { useState, ChangeEvent } from "react";

const Signup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [direction, setDirection] = useState<"left" | "right">("right");

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) (next as HTMLInputElement).focus();
    }
  };

  // Handle profile pic preview
  const handleProfilePic = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfilePic(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Validation for each step
  const validateStep = () => {
    const newErrors: { [key: string]: string } = {};
    if (step === 1) {
      if (!email) newErrors.email = "Email is required";
      else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
        newErrors.email = "Invalid email address";
    } else if (step === 2) {
      if (otp.some((d) => !d)) newErrors.otp = "All OTP fields required";
    } else if (step === 3) {
      if (!name) newErrors.name = "Name is required";
      if (!dob) newErrors.dob = "Date of birth is required";
      if (!password) newErrors.password = "Password is required";
      if (!confirmPassword)
        newErrors.confirmPassword = "Confirm password is required";
      if (password && confirmPassword && password !== confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep()) {
      setDirection("right");
      setStep((s) => s + 1);
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

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg overflow-hidden">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#2563eb]">
        Sign Up
      </h2>
      <form onSubmit={handleNext}>
        <div
          key={step}
          className={`transition-all duration-500 ${getAnimationClass()}`}
        >
          {step === 1 && (
            <div>
              <label className="block mb-2 font-medium">Email</label>
              <input
                type="email"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
              <button
                type="submit"
                className="w-full mt-6 py-2 rounded-lg bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] text-white font-semibold shadow hover:from-[#1d4ed8] hover:to-[#3b82f6] transition"
              >
                Send OTP
              </button>
            </div>
          )}
          {step === 2 && (
            <div>
              <label className="block mb-2 font-medium">Enter OTP</label>
              <div className="flex gap-2 mb-2">
                {otp.map((digit, idx) => (
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
              {errors.otp && (
                <p className="text-red-500 text-sm mb-1">{errors.otp}</p>
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
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] text-white font-semibold shadow hover:from-[#1d4ed8] hover:to-[#3b82f6] transition"
                >
                  Verify OTP
                </button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <label className="block mb-2 font-medium">Name</label>
              <input
                type="text"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
              <label className="block mt-4 mb-2 font-medium">
                Date of Birth
              </label>
              <input
                type="date"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] ${
                  errors.dob ? "border-red-500" : "border-gray-300"
                }`}
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
              {errors.dob && (
                <p className="text-red-500 text-sm mt-1">{errors.dob}</p>
              )}
              <label className="block mt-4 mb-2 font-medium">Password</label>
              <input
                type="password"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
              <label className="block mt-4 mb-2 font-medium">
                Confirm Password
              </label>
              <input
                type="password"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
              <label className="block mt-4 mb-2 font-medium">
                Profile Picture{" "}
                <span className="text-xs text-gray-400">(optional)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                className="w-full"
                onChange={handleProfilePic}
              />
              {profilePic && (
                <div className="mt-2 flex justify-center">
                  <img
                    src={profilePic}
                    alt="Profile Preview"
                    className="w-24 h-24 rounded-full object-cover border border-gray-200"
                  />
                </div>
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
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] text-white font-semibold shadow hover:from-[#1d4ed8] hover:to-[#3b82f6] transition"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default Signup;

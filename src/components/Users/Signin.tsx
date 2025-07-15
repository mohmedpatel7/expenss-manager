"use client";
import React, { useState } from "react";

const Signin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      newErrors.email = "Invalid email address";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // API logic here
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#2563eb]">
        Sign In
      </h2>
      <form onSubmit={handleSubmit}>
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

        <button
          type="submit"
          className="w-full mt-6 py-2 rounded-lg bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] text-white font-semibold shadow hover:from-[#1d4ed8] hover:to-[#3b82f6] transition"
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Signin;

"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/Redux/store/store";
import { updateUserProfile } from "@/Redux/Slices/AuthSlices";
import { useToast } from "../Common/Toast";

interface UpdateProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const UpdateProfileModal: React.FC<UpdateProfileModalProps> = ({
  open,
  onClose,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { showToast } = useToast();

  const userProfile = useSelector((state: RootState) => state.auth.userProfile);

  const [form, setForm] = useState({
    name: "",
    dob: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const isUser =
    typeof window !== "undefined" ? localStorage.getItem("usertoken") : null;

  useEffect(() => {
    if (open && userProfile) {
      setForm({
        name: userProfile.name || "",
        dob: userProfile.dob
          ? new Date(userProfile.dob).toISOString().split("T")[0]
          : "",
      });
      setErrors({});
    }
  }, [open, userProfile]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!form.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const dobDate = new Date(form.dob);
      if (isNaN(dobDate.getTime())) {
        newErrors.dob = "Invalid date";
      } else if (dobDate > new Date()) {
        newErrors.dob = "Date cannot be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUser || !validateForm()) return;

    setLoading(true);
    try {
      const result = await dispatch(
        updateUserProfile({
          usertoken: isUser,
          name: form.name.trim(),
          dob: form.dob,
        })
      );

      if (result.meta.requestStatus === "fulfilled") {
        showToast("Profile updated successfully!", "success");
        onClose();
      } else {
        showToast(
          (result.payload as { message?: string })?.message ||
            "Failed to update profile",
          "error"
        );
      }
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Something went wrong";
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Update Profile</h2>
          <p className="text-sm text-gray-600 mt-1">
            Update your personal information
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter your full name"
                className={`w-full px-3 py-2 bg-white text-gray-900 placeholder-gray-400 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* DOB */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={form.dob}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, dob: e.target.value }))
                }
                className={`w-full px-3 py-2 bg-white text-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                  errors.dob ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.dob && (
                <p className="text-red-600 text-sm mt-1">{errors.dob}</p>
              )}
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                value={userProfile?.email || ""}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-tr from-blue-600 to-blue-400 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-500 transition disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfileModal;

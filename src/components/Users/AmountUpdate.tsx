"use client";
import React, { useEffect, useRef, useState } from "react";

interface AmountUpdateModalProps {
  open: boolean;
  onClose: () => void;
}

const AmountUpdateModal: React.FC<AmountUpdateModalProps> = ({
  open,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [amount, setAmount] = useState("");

  const isUser = localStorage.getItem("usertoken");

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Reset amount when modal opens/closes
  useEffect(() => {
    if (!open) setAmount("");
  }, [open]);

  // Close modal on overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && e.target === modalRef.current) {
      onClose();
    }
  };

  // Close modal on form submit (Update button)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  if (!open) return null;

  const isAmountValid =
    amount.trim() !== "" && !isNaN(Number(amount)) && Number(amount) > 0;

  return (
    <>
      {isUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          ref={modalRef}
          onClick={handleOverlayClick}
        >
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 relative text-gray-900">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none"
              onClick={onClose}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-[#2563eb]">
              Update Amount
            </h2>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block mb-2 font-medium text-gray-800"
                  htmlFor="amount"
                >
                  Amount
                </label>
                <input
                  id="amount"
                  type="number"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] border-gray-300 text-gray-900 placeholder-gray-400"
                  placeholder="Enter amount"
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label
                  className="block mb-2 font-medium text-gray-800"
                  htmlFor="type"
                >
                  Type
                </label>
                <select
                  id="type"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] border-gray-300 text-gray-900"
                >
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full mt-6 py-2 rounded-lg bg-gradient-to-tr from-[#2563eb] to-[#60a5fa] text-white font-semibold shadow hover:from-[#1d4ed8] hover:to-[#3b82f6] transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={!isAmountValid}
              >
                Update
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AmountUpdateModal;

"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface AddressInputProps {
  onNext: (address: string) => void;
  onBack?: () => void;
}

export default function AddressInput({ onNext, onBack }: AddressInputProps) {
  const [address, setAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNext();
  };

  const handleNext = () => {
    if (address.trim()) {
      onNext(address.trim());
    }
  };

  return (
    <div className="min-h-screen bg-teal-900 dark:bg-teal-950 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <h2 className="text-indigo-300 text-xl text-center mb-8">
          Enter your desired neighborhood or work address
        </h2>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="enter here"
            className="w-full px-4 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            autoFocus
          />

          {/* Buttons */}
          <div className="flex gap-4">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-3 text-indigo-300 hover:text-indigo-200 transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                handleNext();
              }}
              disabled={!address.trim()}
              className="flex-1 py-3 bg-indigo-400 text-white rounded-xl font-semibold hover:bg-indigo-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}


"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type CommuteOption = "car" | "public-transit" | "walk" | "bike";

interface CommutePreferenceProps {
  onNext: (commuteOptions: CommuteOption[]) => void;
  onBack?: () => void;
}

export default function CommutePreference({ onNext, onBack }: CommutePreferenceProps) {
  const [selectedOptions, setSelectedOptions] = useState<CommuteOption[]>([]);

  const toggleOption = (option: CommuteOption) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  const handleNext = () => {
    if (selectedOptions.length > 0) {
      onNext(selectedOptions);
    }
  };

  const options: { value: CommuteOption; label: string }[] = [
    { value: "car", label: "Car" },
    { value: "public-transit", label: "Public Transit" },
    { value: "walk", label: "Walk" },
    { value: "bike", label: "Bike" },
  ];

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
          How do you plan to commute?
        </h2>

        {/* Options */}
        <div className="space-y-4 mb-8">
          {options.map((option) => {
            const isSelected = selectedOptions.includes(option.value);
            return (
              <button
                key={option.value}
                onClick={() => toggleOption(option.value)}
                className={`w-full py-4 rounded-xl font-semibold transition-all ${
                  isSelected
                    ? "bg-gray-700 dark:bg-gray-600 text-white border-2 border-indigo-400"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="flex-1 py-3 text-indigo-300 hover:text-indigo-200 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={selectedOptions.length === 0}
            className="flex-1 py-3 bg-indigo-400 text-white rounded-xl font-semibold hover:bg-indigo-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </motion.div>
    </div>
  );
}


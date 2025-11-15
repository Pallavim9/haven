"use client";

import { motion } from "framer-motion";
import DarkModeToggle from "./DarkModeToggle";
import HavenLogo from "./HavenLogo";

interface OnboardingLandingProps {
  onSignUp: () => void;
  onLogIn: () => void;
  onBack?: () => void;
}

export default function OnboardingLanding({ onSignUp, onLogIn, onBack }: OnboardingLandingProps) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center px-6 relative">
      {/* Dark Mode Toggle */}
      <div className="absolute top-6 right-6">
        <DarkModeToggle />
      </div>

      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 text-indigo-600 dark:text-indigo-300 hover:text-indigo-700 dark:hover:text-indigo-200 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <HavenLogo size="md" showAnimation={true} />
      </motion.div>

      {/* App Name */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-4"
      >
        Haven
      </motion.h1>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-gray-700 dark:text-white text-lg mb-12 text-center"
      >
        Search. Connect. Move.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full max-w-sm space-y-4"
      >
        <button
          onClick={onSignUp}
          className="w-full py-4 bg-indigo-600 dark:bg-indigo-400 text-white dark:text-gray-900 rounded-xl font-semibold text-lg hover:bg-indigo-700 dark:hover:bg-indigo-300 transition-colors"
        >
          Sign Up
        </button>
        <button
          onClick={onLogIn}
          className="w-full py-4 bg-indigo-600 dark:bg-indigo-400 text-white dark:text-gray-900 rounded-xl font-semibold text-lg hover:bg-indigo-700 dark:hover:bg-indigo-300 transition-colors"
        >
          Log in
        </button>
      </motion.div>
    </div>
  );
}


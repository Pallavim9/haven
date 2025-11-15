"use client";

import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import OnboardingLanding from "@/components/OnboardingLanding";
import AddressInput from "@/components/AddressInput";
import CommutePreference from "@/components/CommutePreference";
import CardStack from "@/components/CardStack";
import LikedListings from "@/components/LikedListings";
import DarkModeToggle from "@/components/DarkModeToggle";
import { fakeListings, ApartmentListing } from "@/lib/data";

type View = "marketing" | "onboarding" | "address" | "commute" | "swipe" | "liked";
type CommuteOption = "car" | "public-transit" | "walk" | "bike";

export default function Home() {
  const [view, setView] = useState<View>("marketing");
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [hasCompletedAll, setHasCompletedAll] = useState(false);
  
  // Onboarding state
  const [userAddress, setUserAddress] = useState<string>("");
  const [commuteOptions, setCommuteOptions] = useState<CommuteOption[]>([]);

  const likedListings = fakeListings.filter((listing) => likedIds.has(listing.id));

  // Marketing landing page
  if (view === "marketing") {
    return <LandingPage onGetStarted={() => setView("onboarding")} />;
  }

  // Onboarding landing (Sign Up/Log in)
  if (view === "onboarding") {
    return (
      <OnboardingLanding
        onSignUp={() => setView("address")}
        onLogIn={() => setView("address")}
        onBack={() => setView("marketing")}
      />
    );
  }

  // Address input
  if (view === "address") {
    return (
      <AddressInput
        onNext={(address) => {
          setUserAddress(address);
          setView("commute");
        }}
        onBack={() => setView("onboarding")}
      />
    );
  }

  // Commute preference
  if (view === "commute") {
    return (
      <CommutePreference
        onNext={(options) => {
          setCommuteOptions(options);
          setView("swipe");
        }}
        onBack={() => setView("address")}
      />
    );
  }

  const handleRemoveLike = (listingId: string) => {
    setLikedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(listingId);
      return newSet;
    });
  };

  if (view === "liked") {
    return (
      <LikedListings
        likedListings={likedListings}
        onBack={() => setView("swipe")}
        onRemoveLike={handleRemoveLike}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Haven</h1>
          <div className="flex gap-4 items-center">
            <DarkModeToggle />
            {likedIds.size > 0 && (
              <button
                onClick={() => setView("liked")}
                className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors flex items-center gap-2 font-semibold"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                Liked ({likedIds.size})
              </button>
            )}
            <button
              onClick={() => setView("marketing")}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
        <CardStack 
          listings={fakeListings} 
          onLikedChange={setLikedIds}
          initialLikedIds={likedIds}
          onViewLiked={() => setView("liked")}
          initialCompleted={hasCompletedAll}
          onCompletedChange={setHasCompletedAll}
        />
      </div>
    </div>
  );
}

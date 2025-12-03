"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LandingPage from "@/components/LandingPage";
import OnboardingLanding from "@/components/OnboardingLanding";
import { useUser } from "@/contexts/UserContext";
import { useState } from "react";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useUser();
  const [view, setView] = useState<"marketing" | "onboarding">("marketing");
  const isExplicitHome = searchParams.get("home") === "true";

  // Check if user is logged in on initial mount and redirect to swipe
  // But don't redirect if explicitly navigating to home via "Back to Home"
  useEffect(() => {
    if (isLoggedIn && view === "marketing" && !isExplicitHome) {
      router.push("/swipe");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, isExplicitHome]); // Only run when login status or explicit home changes

  // Marketing landing page
  if (view === "marketing") {
    return (
      <LandingPage
        onGetStarted={() => {
          if (isLoggedIn) {
            router.push("/swipe");
          } else {
            setView("onboarding");
          }
        }}
      />
    );
  }

  // Onboarding landing (Sign Up/Log in)
  if (view === "onboarding") {
    return (
      <OnboardingLanding
        onSignUp={() => {
          // New users are prompted for preferences
          router.push("/preferences");
        }}
        onLogIn={() => {
          // Existing users go straight to swipe (preferences already set)
          router.push("/swipe");
        }}
        onBack={() => setView("marketing")}
      />
    );
  }

  return null;
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}

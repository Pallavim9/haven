"use client";

import { HavenLogoIcon } from "@/lib/icons";

interface HavenLogoProps {
  size?: "sm" | "md" | "lg";
  showAnimation?: boolean;
}

export default function HavenLogo({ size = "md", showAnimation = true }: HavenLogoProps) {
  return <HavenLogoIcon size={size} showAnimation={showAnimation} />;
}


"use client";

import { useRouter } from "next/navigation";
import { LandingPage } from "@/app/components/landing-page";

export default function LandingRoute() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/auth");
  };

  return <LandingPage onGetStarted={handleGetStarted} />;
}
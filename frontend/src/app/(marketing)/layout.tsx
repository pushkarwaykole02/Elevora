import type { Metadata } from "next";
import TopNav from "@/components/TopNav";

export const metadata: Metadata = {
  title: "Elevora | AI Interview Mastery",
  description: "Master interviews with AI-powered luminescent intelligence. Real-time feedback, biometric analysis, and hyper-realistic AI interrogators.",
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNav />
      {children}
    </>
  );
}

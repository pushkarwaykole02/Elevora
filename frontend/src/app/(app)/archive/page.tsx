import type { Metadata } from "next";
import { auth } from "@/auth";
import ArchiveClient, { type SessionItem } from "./ArchiveClient";

export const metadata: Metadata = {
  title: "Session Archive",
  description: "Browse and replay all your past Elevora interview sessions.",
};

async function getUserSessions(userId: string) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  try {
    const res = await fetch(`${backendUrl}/api/users/${userId}/sessions?limit=all`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Error fetching user sessions in ArchivePage:", err);
    return null;
  }
}

export default async function ArchivePage() {
  const authSession = await auth();
  const userId = authSession?.user?.id;

  let data = null;
  if (userId) {
    data = await getUserSessions(userId);
  }

  const allSessions: SessionItem[] = data?.sessions || [];

  const completedRecent = allSessions.slice(0, 5).filter((s) => s.status === "COMPLETED");
  const recentScore = completedRecent.length > 0
    ? Math.round(completedRecent.reduce((sum, s) => sum + s.score, 0) / completedRecent.length)
    : 0;

  const completedAll = allSessions.filter((s) => s.status === "COMPLETED");
  const allScore = completedAll.length > 0
    ? Math.round(completedAll.reduce((sum, s) => sum + s.score, 0) / completedAll.length)
    : 0;

  const stats = {
    recent: {
      totalSessions: Math.min(5, allSessions.length),
      completedSessions: completedRecent.length,
      averageScore: `${recentScore}%`,
      hours: data?.stats?.recent?.hours || "1.5h",
    },
    allTime: {
      totalSessions: allSessions.length,
      completedSessions: completedAll.length,
      averageScore: `${allScore}%`,
      hours: data?.stats?.allTime?.hours || "2.5h",
    },
  };

  return <ArchiveClient allSessions={allSessions} stats={stats} />;
}

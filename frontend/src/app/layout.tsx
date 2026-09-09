import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-headline",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Elevora | AI Interview Mastery",
    template: "%s | Elevora",
  },
  description:
    "The world's first luminescent interview simulator. Elevate your professional presence with real-time biometric feedback and industry-specific AI interrogators.",
  keywords: ["AI interview", "mock interview", "interview practice", "career growth", "interview coach"],
  authors: [{ name: "Elevora" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Elevora",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} dark`}
    >
      <head>
        {/* Material Symbols for icons */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-screen bg-[var(--color-background)] text-[var(--color-on-surface)] antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

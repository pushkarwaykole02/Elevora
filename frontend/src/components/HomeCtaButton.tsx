"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import React from "react";

interface HomeCtaButtonProps {
  id: string;
  className?: string;
  children: React.ReactNode;
  initialHref?: string;
}

export default function HomeCtaButton({
  id,
  className,
  children,
  initialHref = "/sign-up",
}: HomeCtaButtonProps) {
  const { status } = useSession();

  let href = initialHref;
  if (status === "authenticated") {
    href = "/interview/setup";
  } else if (status === "unauthenticated") {
    href = "/sign-up";
  }

  return (
    <Link href={href} id={id} className={className}>
      {children}
    </Link>
  );
}

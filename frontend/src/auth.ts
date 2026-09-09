import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          const res = await fetch(`${backendUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();
          if (res.ok && data.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              image: data.user.avatarUrl || null,
            };
          }
          return null;
        } catch (error) {
          console.error("Error during credentials authorization:", error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        if (!user.email || !user.name) {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      console.log("[NextAuth JWT] Entered. Current sub:", token.sub, "trigger:", trigger);
      if (user) {
        console.log("[NextAuth JWT] Initial sign in user object:", user);
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }

      // Check if the current sub is a valid UUID
      const isUuid = token.sub && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token.sub as string);
      console.log("[NextAuth JWT] Is sub UUID:", isUuid);

      // Trigger sync if it's the initial sign-in for OAuth OR if we have an existing session with a non-UUID sub
      const shouldSync = (account && (account.provider === "google" || account.provider === "github")) || (!isUuid && token.email);
      console.log("[NextAuth JWT] Should sync user with backend:", shouldSync);

      if (shouldSync) {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          console.log(`[NextAuth JWT] Syncing user ${token.email} with backend at ${backendUrl}/api/auth/sync-user`);
          const response = await fetch(`${backendUrl}/api/auth/sync-user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: token.email,
              name: token.name || "OAuth User",
              avatarUrl: token.picture || null,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log("[NextAuth JWT] Sync response user data:", data.user);
            if (data.user?.id) {
              token.sub = data.user.id;
              console.log("[NextAuth JWT] Updated token.sub to database UUID:", token.sub);
            }
          } else {
            console.error("[NextAuth JWT] Failed to sync user with Express backend in jwt callback. Status:", response.status);
          }
        } catch (error) {
          console.error("[NextAuth JWT] Error calling Express sync-user endpoint in jwt callback:", error);
        }
      }

      if (trigger === "update" && session) {
        token.name = session.name ?? token.name;
        token.email = session.email ?? token.email;
        token.picture = session.image ?? token.picture;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[NextAuth Session] Entered. Token sub:", token?.sub);
      if (token?.sub && session.user) {
        session.user.id = token.sub as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
      }
      console.log("[NextAuth Session] Returning session user id:", session?.user?.id);
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
});

"use client";

import { ReactNode, useEffect } from "react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient, useMutation } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function SyncUserWithConvex({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth(); // We updated this to use isSignedIn
  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    if (isSignedIn) {
      // Fires the mutation to create the user in the Data tab
      storeUser().catch((err) => console.error("Failed to sync user:", err));
    }
  }, [isSignedIn, storeUser]);

  return <>{children}</>;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <SyncUserWithConvex>{children}</SyncUserWithConvex>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
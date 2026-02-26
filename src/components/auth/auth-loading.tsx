"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useState } from "react";

export function AuthLoading({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const storeUser = useMutation(api.users.store);
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const syncUser = async () => {
      try {
        await storeUser({
          name: user.fullName ?? user.username ?? "Anonymous",
          email: user.emailAddresses[0].emailAddress,
          imageUrl: user.imageUrl,
        });
      } catch (error) {
        console.error("Error syncing user:", error);
      } finally {
        setIsSyncing(false);
      }
    };

    syncUser();
  }, [isLoaded, user, storeUser]);

  if (!isLoaded || isSyncing) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        {/* You can replace this with a Shadcn Skeleton later for Feature 13 */}
        <div className="animate-pulse text-lg font-medium text-gray-500">
          Syncing your profile...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
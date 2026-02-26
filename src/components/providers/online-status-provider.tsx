"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function OnlineStatusTracker({ children }: { children: React.ReactNode }) {
  const setStatus = useMutation(api.users.updateStatus);

  useEffect(() => {
    // Set user to online when they open the app
    setStatus({ isOnline: true });

    // Set user to offline when they close the tab
    const handleTabClose = () => setStatus({ isOnline: false });
    window.addEventListener("beforeunload", handleTabClose);

    return () => {
      setStatus({ isOnline: false });
      window.removeEventListener("beforeunload", handleTabClose);
    };
  }, [setStatus]);

  return <>{children}</>;
}
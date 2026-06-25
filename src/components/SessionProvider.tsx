"use client";

import { createAuthClient } from "better-auth/react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const authClient = createAuthClient();

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    const { data: session } = authClient.useSession();
    return () => {};
  }, []);

  return <>{children}</>;
}

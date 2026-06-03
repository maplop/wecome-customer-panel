"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { isAccessTokenValid } from "@/lib/auth-session";

export function useAuthGuard(enabled: boolean): void {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (!isAccessTokenValid()) {
      router.replace(ROUTES.ONBOARDING.CURP_VERIFICATION);
    }
  }, [enabled, router]);
}

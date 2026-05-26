"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  ClientWhitelistData,
  verifyCurpInWhitelist,
} from "@/services/onboarding";

export type ClientProps = ClientWhitelistData;

interface ClientVerificationState {
  loading: boolean;
  error: string | null;
  data: ClientProps | null;
  verifyCurp: (curp: string) => Promise<ClientProps | null>;
  reset: () => void;
}

export const useClientVerificationStore = create<ClientVerificationState>()(
  persist(
    (set) => ({
      loading: false,
      error: null,
      data: null,

      verifyCurp: async (curp: string): Promise<ClientProps | null> => {
        set({ loading: true, error: null, data: null });

        try {
          const whitelistData = await verifyCurpInWhitelist(curp);

          if (!whitelistData) {
            set({
              loading: false,
              error: "No se encontraron datos para la CURP ingresada.",
            });
            return null;
          }

          set({ loading: false, data: whitelistData });
          return whitelistData;
        } catch {
          set({
            loading: false,
            error: "Error al verificar la CURP. Intenta nuevamente.",
          });
          return null;
        }
      },

      reset: () => set({ loading: false, error: null, data: null }),
    }),
    {
      name: "client-verification-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        data: state.data,
      }),
    },
  ),
);

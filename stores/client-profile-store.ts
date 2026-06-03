"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { verifyCurpInWhitelist } from "@/services/onboarding/onboarding";
import { ClientProfileType } from "@/types/client-profile";

interface ClientProfileState {
  loading: boolean;
  error: string | null;
  data: ClientProfileType | null;
  verifyCurp: (curp: string) => Promise<ClientProfileType | null>;
  reset: () => void;
}

export const useClientProfileStore = create<ClientProfileState>()(
  persist(
    (set) => ({
      loading: false,
      error: null,
      data: null,

      verifyCurp: async (curp: string): Promise<ClientProfileType | null> => {
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

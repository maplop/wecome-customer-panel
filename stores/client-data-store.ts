"use client";

import { apiClient, SERVICES } from "@/api/dynamicore/frontend";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ClientPiiType } from "@/types/client-data/client";

export interface ClientDataState {
  setClientData: (clientData: ClientData) => void;
  setClientDataResponse: (
    response: GatewayEnvelope<ClientData | ClientData[]>,
  ) => void;
  fetchClientDataById: (
    clientId: number | string,
  ) => Promise<GatewayEnvelope<ClientData | ClientData[]>>;
  clearClientData: () => void;
}

export const useClientDataStore = create<ClientDataState>()(
  persist(
    (set) => ({
      data: undefined,
      clientData: undefined,
      clientDataResponse: undefined,
      setClientData: (clientData) =>
        set({
          clientData,
          data: { people: clientData },
        }),
      setClientDataResponse: (response) => {
        const peopleData = response?.data;
        const clientData = Array.isArray(peopleData)
          ? (peopleData[0] ?? undefined)
          : peopleData;

        set({
          clientDataResponse: response,
          clientData,
          data: clientData ? { people: clientData } : undefined,
        });
      },
      fetchClientDataById: async (clientId) => {
        const { data: response } = await apiClient.get<
          GatewayEnvelope<ClientData | ClientData[]>
        >(SERVICES.PEOPLE, {
          params: { id: clientId },
        });

        const peopleData = response?.data;
        const clientData = Array.isArray(peopleData)
          ? (peopleData[0] ?? undefined)
          : peopleData;

        set({
          clientDataResponse: response,
          clientData,
          data: clientData ? { people: clientData } : undefined,
        });

        return response;
      },
      clearClientData: () =>
        set({
          data: undefined,
          clientData: undefined,
          clientDataResponse: undefined,
        }),
    }),
    {
      name: "client-data-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        data: state.data,
        clientData: state.clientData,
        clientDataResponse: state.clientDataResponse,
      }),
    },
  ),
);

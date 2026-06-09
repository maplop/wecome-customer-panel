import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ClientRequestRecord } from "@/types/client-request";

function sortByLatest(requests: ClientRequestRecord[]): ClientRequestRecord[] {
  return [...requests].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );
}

interface ClientRequestStore {
  clientId: number | null;
  requests: ClientRequestRecord[];
  activeRequestId: string | null;
  syncClientRequests: (
    clientId: number,
    requests: ClientRequestRecord[],
  ) => void;
  setActiveRequestId: (requestId: string | null) => void;
  upsertRequest: (request: ClientRequestRecord, setAsActive?: boolean) => void;
  getActiveRequest: () => ClientRequestRecord | null;
  clearRequests: () => void;
}

export const useClientRequestStore = create<ClientRequestStore>()(
  persist(
    (set, get) => ({
      clientId: null,
      requests: [],
      activeRequestId: null,

      syncClientRequests: (incomingClientId, incomingRequests) => {
        const sorted = sortByLatest(incomingRequests);
        const current = get();
        const isSameClient = current.clientId === incomingClientId;
        const canKeepCurrentActive =
          isSameClient &&
          Boolean(
            current.activeRequestId &&
              sorted.some((item) => item.id === current.activeRequestId),
          );

        const nextActiveRequestId = canKeepCurrentActive
          ? current.activeRequestId
          : (sorted[0]?.id ?? null);

        console.log("[client-request-store] syncClientRequests", {
          clientId: incomingClientId,
          requests: sorted,
          activeRequestId: nextActiveRequestId,
        });

        set({
          clientId: incomingClientId,
          requests: sorted,
          activeRequestId: nextActiveRequestId,
        });
      },

      setActiveRequestId: (requestId) => {
        if (!requestId) {
          set({ activeRequestId: null });
          return;
        }

        const exists = get().requests.some((item) => item.id === requestId);
        if (!exists) return;

        set({ activeRequestId: requestId });
      },

      upsertRequest: (request, setAsActive = false) => {
        const current = get();
        const rest = current.requests.filter((item) => item.id !== request.id);
        const sorted = sortByLatest([request, ...rest]);

        set({
          clientId: request.client,
          requests: sorted,
          activeRequestId: setAsActive
            ? request.id
            : (current.activeRequestId ?? request.id),
        });
      },

      getActiveRequest: () => {
        const current = get();
        if (!current.activeRequestId) return null;

        return (
          current.requests.find(
            (item) => item.id === current.activeRequestId,
          ) ?? null
        );
      },

      clearRequests: () => set({ clientId: null, requests: [], activeRequestId: null }),
    }),
    {
      name: "client-request-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        clientId: state.clientId,
        requests: state.requests,
        activeRequestId: state.activeRequestId,
      }),
    },
  ),
);

// stores/index.ts
import { useClientDataStore } from "@/stores/client-data-store";
import { useClientProfileStore } from "@/stores/client-profile-store";
import { useClientRequestStore } from "@/stores/client-request-store";

export const clearAllStores = () => {
  useClientDataStore.getState().clearClient();
  useClientProfileStore.getState().reset();
  useClientRequestStore.getState().clearRequests();
};

export { useClientDataStore, useClientProfileStore, useClientRequestStore };

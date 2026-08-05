// stores/index.ts
import { useClientDataStore } from "@/stores/client-data-store";
import { useClientProfileStore } from "@/stores/client-profile-store";
import { useClientRequestStore } from "@/stores/client-request-store";
import { useCreditDetailsStore } from "@/stores/credit-details-store";

export const clearAllStores = () => {
  useClientDataStore.getState().clearClient();
  useClientProfileStore.getState().reset();
  useClientRequestStore.getState().clearRequests();
  useCreditDetailsStore.getState().clearCreditDetails();
};

export {
  useClientDataStore,
  useClientProfileStore,
  useClientRequestStore,
  useCreditDetailsStore,
};

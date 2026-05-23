"use client";

import { create } from "zustand";
import axios from "axios";

import { CONNECTOR_BASE_URL, CONNECTOR_ENDPOINTS } from "@/lib/api/api-config";

export interface ClientProps {
  actividad_economica: string;
  correo_electronico: string;
  curp: string;
  datos_de_contacto: string;
  domicilio_fiscal_y_particular: string;
  empresa: string;
  fecha_de_nacimiento: string;
  nacionalidad: string;
  nivel_de_estudios: string;
  nombres: string;
  numero_identificacion_oficial: string;
  ocupacion: string;
  primer_apellido: string;
  rfc: string;
  segundo_apellido: string;
  telefono: string;
  tipo_identificacion_oficial: string;
  created_at: string;
  _ingested_timestamp: number;
}

interface ResponseHit {
  _index: string;
  _id: string;
  _score: number;
  _source: ClientProps;
}

interface ClientResponse {
  page: number;
  limit: number;
  total: number;
  hits: ResponseHit[];
}

interface ClientVerificationState {
  loading: boolean;
  error: string | null;
  data: ClientProps | null;
  verifyCurp: (curp: string) => Promise<ClientProps | null>;
  reset: () => void;
}

const CONNECTOR_SEARCH_URL = `${CONNECTOR_BASE_URL}${CONNECTOR_ENDPOINTS.SEARCH_CURP}`;

export const useClientVerificationStore = create<ClientVerificationState>(
  (set) => ({
    loading: false,
    error: null,
    data: null,

    verifyCurp: async (curp: string): Promise<ClientProps | null> => {
      set({ loading: true, error: null, data: null });

      try {
        const response = await axios.post<ClientResponse>(
          CONNECTOR_SEARCH_URL,
          {
            fields: [`curp:${curp}`],
            page: 1,
            limit: 10,
          },
        );

        const hit = response.data.hits?.[0];

        if (!hit?._source) {
          set({
            loading: false,
            error: "No se encontraron datos para la CURP ingresada.",
          });
          return null;
        }

        set({ loading: false, data: hit._source });
        return hit._source;
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
);

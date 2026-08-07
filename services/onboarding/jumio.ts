import { apiClient, SERVICES } from "@/sdk/dynamicore/frontend";
import { getSignedUrl } from "@/utils/aws/s3";

interface JumioVerificationPayload {
  client: string;
  front_image_b64: string;
  back_image_b64: string;
}

interface JumioVerificationData {
  valid?: boolean;
  [key: string]: unknown;
}

interface JumioIneStartData extends JumioVerificationData {
  status?: string;
  accountId?: string;
  workflowId?: string;
}

interface VerifyIneWithJumioInput {
  clientId: string;
  frontImage: string;
  backImage: string;
  awaitFinalStatus?: boolean;
  onStatusResolved?: JumioStatusResolvedCallback;
  onStatusError?: JumioStatusErrorCallback;
}

interface VerifyIneWithJumioResult {
  valid: boolean;
  data: unknown;
}

type JumioStatusResolvedCallback = (result: VerifyIneWithJumioResult) => void;
type JumioStatusErrorCallback = (error: Error) => void;

type SignedUrlLike = string | { url?: unknown };

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractEnvelopeData<T>(responseData: unknown): T {
  const data = (responseData as { data?: unknown })?.data;
  return (data as T) ?? (responseData as T);
}

function extractNestedData(source: unknown, maxDepth = 4): unknown {
  let current = source;
  let depth = 0;

  while (
    depth < maxDepth &&
    current &&
    typeof current === "object" &&
    "data" in (current as Record<string, unknown>)
  ) {
    const next = (current as { data?: unknown }).data;
    if (next == null) break;
    current = next;
    depth += 1;
  }

  return current;
}

function toLowerText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function toUpperText(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

function normalizeSignedUrl(input: SignedUrlLike, fallback: string): string {
  if (typeof input === "string" && input.trim()) return input;

  if (input && typeof input === "object" && "url" in input) {
    const value = String(input.url ?? "").trim();
    if (value) return value;
  }

  return fallback;
}

function stripDataUrlPrefix(dataUrl: string): string {
  const commaIndex = dataUrl.indexOf(",");
  return commaIndex >= 0 ? dataUrl.slice(commaIndex + 1) : dataUrl;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      resolve(stripDataUrlPrefix(dataUrl));
    };
    reader.onerror = () =>
      reject(new Error("No se pudo convertir la imagen a base64."));
    reader.readAsDataURL(blob);
  });
}

export function shouldRetryJumio(message: unknown): boolean {
  const text = toLowerText(message);
  return (
    text.includes("timed out") ||
    text.includes("timeout") ||
    text.includes("temporarily unavailable")
  );
}

export function extractJumioMessage(source: unknown): string {
  if (!source) return "";
  if (typeof source === "string") return source.trim();

  if (typeof source === "object") {
    const record = source as Record<string, unknown>;
    const directMessage =
      record.message ?? record.msg ?? record.error ?? record.detail;

    if (typeof directMessage === "string" && directMessage.trim()) {
      return directMessage.trim();
    }

    if (record.data) {
      return extractJumioMessage(record.data);
    }
  }

  return "";
}

export function getActiveDocumentUrl(
  sourceUrl: string,
  signedCandidate: SignedUrlLike,
): string {
  const raw = sourceUrl.trim();
  if (raw) return raw;

  const signed = normalizeSignedUrl(signedCandidate, "");
  if (signed) return signed;

  throw new Error("No se recibió la imagen del documento.");
}

export async function postJumioWithRetry(
  payload: JumioVerificationPayload,
  maxAttempts = 3,
): Promise<unknown> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await apiClient.post(
        SERVICES.JUMIO_VERIFICATION,
        payload,
        { timeout: 180000 }, // 3 minutos para la llamada específica a Jumio
      );
      const responseMessage = extractJumioMessage(response.data);

      if (shouldRetryJumio(responseMessage)) {
        throw new Error(responseMessage || "Endpoint request timed out");
      }

      return response.data;
    } catch (error) {
      lastError = error;
      const responseData = (error as { response?: { data?: unknown } })
        ?.response?.data;
      const responseMessage = extractJumioMessage(responseData);
      const errorMessage = extractJumioMessage(error);
      const message = responseMessage || errorMessage;

      if (!shouldRetryJumio(message) || attempt === maxAttempts) {
        throw error;
      }

      await delay(800 * attempt);
    }
  }

  throw lastError;
}

async function getJumioIneStatus(accountId: string, workflowId: string) {
  const response = await apiClient.get(SERVICES.JUMIO_VERIFICATION, {
    params: {
      type: "ine",
      accountId,
      workflowId,
    },
    timeout: 120000,
  });

  return response.data;
}

async function getJumioIneStatusWithRetry(
  accountId: string,
  workflowId: string,
  maxAttempts = 3,
): Promise<unknown> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const responseData = await getJumioIneStatus(accountId, workflowId);
      const responseMessage = extractJumioMessage(responseData);

      if (shouldRetryJumio(responseMessage)) {
        throw new Error(responseMessage || "Endpoint request timed out");
      }

      return responseData;
    } catch (error) {
      lastError = error;
      const responseData = (error as { response?: { data?: unknown } })
        ?.response?.data;
      const responseMessage = extractJumioMessage(responseData);
      const errorMessage = extractJumioMessage(error);
      const message = responseMessage || errorMessage;

      if (!shouldRetryJumio(message) || attempt === maxAttempts) {
        throw error;
      }

      await delay(800 * attempt);
    }
  }

  throw lastError;
}

function isFinalJumioStatus(status: unknown): boolean {
  const upperStatus = toUpperText(status);
  if (!upperStatus) return false;

  return [
    "PROCESSED",
    "APPROVED_VERIFIED",
    "REJECTED",
    "FAILED",
    "ERROR",
    "DENIED",
    "EXPIRED",
    "ABANDONED",
  ].includes(upperStatus);
}

async function pollJumioIneStatus(
  accountId: string,
  workflowId: string,
): Promise<JumioVerificationData> {
  const maxPollAttempts = 20;
  const pollDelayMs = 10000;
  let lastData: JumioVerificationData = {};

  for (let attempt = 1; attempt <= maxPollAttempts; attempt += 1) {
    const statusResponse = await getJumioIneStatusWithRetry(
      accountId,
      workflowId,
    );
    const firstLevel = extractEnvelopeData<unknown>(statusResponse);
    const statusData = extractNestedData(firstLevel) as JumioVerificationData;
    lastData = statusData ?? {};

    if (statusData?.valid === true) {
      return statusData;
    }

    const workflowStatus =
      statusData?.workflowStatus ?? statusData?.status ?? statusData?.decision;

    if (isFinalJumioStatus(workflowStatus)) {
      return statusData;
    }

    if (attempt < maxPollAttempts) {
      await delay(pollDelayMs);
    }
  }

  throw new Error(
    extractJumioMessage(lastData) ||
      "La validación de INE sigue en proceso. Intenta nuevamente en unos segundos.",
  );
}

async function fetchUrlAsBase64(url: string): Promise<string> {
  if (url.startsWith("data:")) {
    return stripDataUrlPrefix(url);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`No se pudo descargar la imagen (${response.status}).`);
  }

  const blob = await response.blob();
  return blobToBase64(blob);
}

export async function verifyIneWithJumio(
  input: VerifyIneWithJumioInput,
): Promise<VerifyIneWithJumioResult> {
  // 1) Obtener URL firmada inicial.
  const [frontSignedInitial, backSignedInitial] = await Promise.all([
    getSignedUrl(input.frontImage),
    getSignedUrl(input.backImage),
  ]);

  // 2) Obtener URL activa por imagen.
  const frontActiveUrl = getActiveDocumentUrl(
    input.frontImage,
    frontSignedInitial,
  );
  const backActiveUrl = getActiveDocumentUrl(
    input.backImage,
    backSignedInitial,
  );

  // 3) Verificar ambas imagenes.
  if (!frontActiveUrl || !backActiveUrl) {
    throw new Error("No se recibieron ambas imágenes del documento.");
  }

  // 4) Obtener URL firmada con 300 segundos.
  const [frontSigned300Raw, backSigned300Raw] = await Promise.all([
    getSignedUrl(frontActiveUrl, 300),
    getSignedUrl(backActiveUrl, 300),
  ]);
  const frontSigned300 = normalizeSignedUrl(frontSigned300Raw, frontActiveUrl);
  const backSigned300 = normalizeSignedUrl(backSigned300Raw, backActiveUrl);

  // 5) Descargar desde S3 y convertir a base64.
  const [frontBase64, backBase64] = await Promise.all([
    fetchUrlAsBase64(frontSigned300),
    fetchUrlAsBase64(backSigned300),
  ]);

  // 6) Reintentos con delay + POST a Jumio.
  const response = await postJumioWithRetry({
    client: input.clientId,
    front_image_b64: frontBase64,
    back_image_b64: backBase64,
  });

  // 7) Leer respuesta inicial para obtener identificadores de seguimiento.
  const firstLevel = extractEnvelopeData<unknown>(response);
  const startData = extractNestedData(firstLevel) as JumioIneStartData;

  // Compatibilidad con respuestas sin polling.
  if (startData?.valid === true) {
    return {
      valid: true,
      data: startData,
    };
  }

  const accountId = String(startData?.accountId ?? "").trim();
  const workflowId = String(startData?.workflowId ?? "").trim();
  const shouldAwaitFinalStatus = input.awaitFinalStatus === true;

  if (!accountId || !workflowId) {
    throw new Error(
      extractJumioMessage(startData) ||
        "No fue posible obtener el estado de validación de INE.",
    );
  }

  // Flujo no bloqueante por defecto: inicia validación y permite continuar onboarding.
  if (!shouldAwaitFinalStatus) {
    // Ejecuta el polling en segundo plano para consultar estatus cada 10 segundos.
    void pollJumioIneStatus(accountId, workflowId)
      .then((finalData) => {
        input.onStatusResolved?.({
          valid: finalData?.valid === true,
          data: finalData,
        });
      })
      .catch((error) => {
        const normalizedError =
          error instanceof Error
            ? error
            : new Error("No se pudo consultar el estatus de validación.");
        input.onStatusError?.(normalizedError);
      });

    return {
      valid: true,
      data: startData,
    };
  }

  // 8) Consultar estatus final con GET ?type=ine&accountId&workflowId.
  const finalData = await pollJumioIneStatus(accountId, workflowId);
  input.onStatusResolved?.({
    valid: finalData?.valid === true,
    data: finalData,
  });

  return {
    valid: finalData?.valid === true,
    data: finalData,
  };
}

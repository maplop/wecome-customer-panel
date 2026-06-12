import { apiClient, SERVICES } from "@/api/dynamicore/frontend";
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

interface VerifyIneWithJumioInput {
  clientId: string;
  frontImage: string;
  backImage: string;
}

interface VerifyIneWithJumioResult {
  valid: boolean;
  data: unknown;
}

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
  return text.includes("timed out") || text.includes("timeout");
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

  // 7) Validar respuesta.
  const firstLevel = extractEnvelopeData<unknown>(response);
  const jumioData = extractNestedData(firstLevel) as JumioVerificationData;

  return {
    valid: jumioData?.valid === true,
    data: jumioData,
  };
}

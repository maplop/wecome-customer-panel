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

async function resolveImageInputToBase64(image: string): Promise<string> {
  const trimmed = image.trim();
  if (!trimmed) {
    throw new Error("No se recibió la imagen del documento.");
  }

  if (trimmed.startsWith("data:")) {
    return stripDataUrlPrefix(trimmed);
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      return await fetchUrlAsBase64Compressed(trimmed);
    } catch {
      const signed = await getSignedUrl(trimmed);
      const signedUrl =
        typeof signed === "string"
          ? signed
          : String((signed as { url?: unknown })?.url || trimmed);
      return fetchUrlAsBase64Compressed(signedUrl);
    }
  }

  const signed = await getSignedUrl(trimmed);
  const signedUrl =
    typeof signed === "string"
      ? signed
      : String((signed as { url?: unknown })?.url || trimmed);
  return fetchUrlAsBase64Compressed(signedUrl);
}

export async function verifyIneWithJumio(
  input: VerifyIneWithJumioInput,
): Promise<VerifyIneWithJumioResult> {
  const [frontBase64, backBase64] = await Promise.all([
    resolveImageInputToBase64(input.frontImage),
    resolveImageInputToBase64(input.backImage),
  ]);

  const response = await postJumioWithRetry({
    client: input.clientId,
    front_image_b64: frontBase64,
    back_image_b64: backBase64,
  });

  const firstLevel = extractEnvelopeData<unknown>(response);
  const jumioData = extractNestedData(firstLevel) as JumioVerificationData;
  return {
    valid: jumioData?.valid === true,
    data: jumioData,
  };
}

async function fetchUrlAsBase64Compressed(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const MAX_WIDTH = 1200;
      const scale = Math.min(1, MAX_WIDTH / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas no disponible"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL("image/jpeg", 0.75).split(",")[1];
      resolve(base64);
    };
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = url;
  });
}

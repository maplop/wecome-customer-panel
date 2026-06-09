import { apiClient } from "@/api/dynamicore/frontend";

const BUCKET = process.env.NEXT_PUBLIC_AWS_BUCKET || "";
const REGION = process.env.NEXT_PUBLIC_AWS_REGION || "us-west-2";
const MAX_ATTEMPTS = 5;

// Keep service paths local to avoid coupling with unrelated API constants.
const S3_SERVICES = {
  USERS_CHECK_DOCUMENT: "/users/checkKeyExist",
  USERS_SIGNIN_DOCUMENT: "/users/signin_documents",
  USERS_PRESIGNIN_DOCUMENT: "/users/presignin_documents",
} as const;

interface PresignedResponse {
  url: string;
  fields: Record<string, string>;
}

interface SignedUrlResponse {
  url?: string;
  [key: string]: unknown;
}

interface UploadOptions {
  onProgress?: (progress: number) => void;
}

interface UploadResult {
  Location: string;
}

function extractEnvelopeData<T>(responseData: unknown): T {
  const data = (responseData as { data?: unknown })?.data;
  return (data as T) ?? (responseData as T);
}

function normalizeS3Path(path: string, repository: string): string {
  return (path ?? "").replace(
    `https://${repository}.s3.${REGION}.amazonaws.com/`,
    "",
  );
}

function splitCompanyAndKey(path: string): { company?: string; key: string } {
  const [company, ...keyParts] = path.replace("company/", "").split("/");
  return {
    company: company || undefined,
    key: `/${keyParts.join("/")}`,
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toBlobPart(
  file: Blob | File | ArrayBuffer | Uint8Array | string,
): BlobPart {
  if (typeof file === "string" || file instanceof Blob || file instanceof ArrayBuffer) {
    return file;
  }

  // Force Uint8Array<ArrayBufferLike> into a true ArrayBuffer for strict BlobPart typing.
  const copy = new Uint8Array(file.byteLength);
  copy.set(file);
  return copy.buffer;
}

export async function checkKeyExist(
  path: string,
  repository: string = BUCKET,
): Promise<unknown> {
  const normalizedPath = normalizeS3Path(path, repository);
  const { company, key } = splitCompanyAndKey(normalizedPath);

  const { data } = await apiClient.post(S3_SERVICES.USERS_CHECK_DOCUMENT, {
    bucket: repository,
    company,
    key,
  });

  return extractEnvelopeData<unknown>(data);
}

export async function getSignedUrl(
  path: string,
  expires = 10,
  repository: string = BUCKET,
): Promise<SignedUrlResponse | string> {
  let attempts = 0;
  let lastError: unknown;

  while (attempts < MAX_ATTEMPTS) {
    try {
      const normalizedPath = normalizeS3Path(path, repository);
      const { company, key } = splitCompanyAndKey(normalizedPath);

      const { data } = await apiClient.post(S3_SERVICES.USERS_SIGNIN_DOCUMENT, {
        bucket: repository,
        company,
        expires,
        key,
      });

      return extractEnvelopeData<SignedUrlResponse | string>(data);
    } catch (error) {
      attempts += 1;
      lastError = error;
      if (attempts < MAX_ATTEMPTS) {
        await delay(attempts * 1000);
      }
    }
  }

  throw lastError;
}

export async function download(path: string, sign = true): Promise<boolean> {
  try {
    const url = sign ? await getSignedUrl(path) : path;

    if (typeof url === "string") {
      window.open(url);
    } else if (url && typeof url === "object" && "url" in url) {
      window.open(String(url.url));
    }

    return true;
  } catch {
    return false;
  }
}

export async function upload(
  path: string,
  file: Blob | File | ArrayBuffer | Uint8Array | string,
  metadata: Record<string, unknown> = {},
  company?: string,
  options: UploadOptions = {},
): Promise<UploadResult> {
  if (path.startsWith("company/")) {
    [, company] = path.split("/");
    path = path.replace(`company/${company}`, "");
  }

  let presigned: PresignedResponse | undefined;
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const { data } = await apiClient.post(
        S3_SERVICES.USERS_PRESIGNIN_DOCUMENT,
        {
          bucket: BUCKET,
          company,
          expires: 60 * 10,
          key: path,
          metadata,
        },
      );

      presigned = extractEnvelopeData<PresignedResponse>(data);
      break;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        await delay(attempt * 1000);
      }
    }
  }

  if (!presigned) {
    throw lastError;
  }

  const formData = new FormData();
  Object.entries(presigned.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("file", new Blob([toBlobPart(file)]));

  const { onProgress } = options;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response =
        typeof onProgress === "function"
          ? await uploadWithProgress(presigned.url, formData, onProgress)
          : await fetch(presigned.url, { method: "POST", body: formData });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      return {
        Location: `https://${BUCKET}.s3.${REGION}.amazonaws.com/${presigned.fields.key}`,
      };
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        await delay(attempt * 1000);
      }
    }
  }

  throw lastError;
}

interface UploadResponse {
  ok: boolean;
  status: number;
}

function uploadWithProgress(
  url: string,
  formData: FormData,
  onProgress: (progress: number) => void,
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", url, true);
    xhr.upload.onprogress = (event: ProgressEvent<EventTarget>) => {
      if (event.lengthComputable) {
        const percent = Math.min(
          100,
          Math.round((event.loaded / event.total) * 100),
        );
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      resolve({
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
      });
    };

    xhr.onerror = () => {
      reject(new Error("Upload failed due to a network error."));
    };

    xhr.send(formData);
  });
}

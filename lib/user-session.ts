const USER_INFO_STORAGE_KEY = "dynamicore_user_info";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

export function setUserInfoSession(data: unknown): void {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(USER_INFO_STORAGE_KEY, JSON.stringify(data));
}

export function getUserInfoSession<T>(): T | null {
  if (!hasWindow()) {
    return null;
  }

  const raw = window.localStorage.getItem(USER_INFO_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearUserInfoSession(): void {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.removeItem(USER_INFO_STORAGE_KEY);
}

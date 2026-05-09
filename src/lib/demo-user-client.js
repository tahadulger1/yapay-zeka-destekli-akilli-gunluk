"use client";

export const DEMO_USER_STORAGE_KEY = "ai-to-demo-user-id";
export const DEMO_USER_HEADER = "x-demo-user-id";

function createDemoUserId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getDemoUserId() {
  if (typeof window === "undefined") {
    return "";
  }

  let demoUserId = window.localStorage.getItem(DEMO_USER_STORAGE_KEY);
  if (!demoUserId) {
    demoUserId = createDemoUserId();
    window.localStorage.setItem(DEMO_USER_STORAGE_KEY, demoUserId);
  }

  return demoUserId;
}

export function withDemoHeaders(headers = {}) {
  return {
    ...headers,
    [DEMO_USER_HEADER]: getDemoUserId(),
  };
}

export function demoFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: withDemoHeaders(options.headers),
  });
}

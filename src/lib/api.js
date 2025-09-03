// src/lib/api.js
const BASE_URL = import.meta.env.VITE_API_URL;

function withHeaders(init = {}) {
  const headers = new Headers(init.headers || {});
  const uid = import.meta.env.VITE_FAKE_USER_ID;
  const asAdmin = String(import.meta.env.VITE_ADMIN_HEADER) === "true";
  if (uid) headers.set("x-user-id", uid);
  if (asAdmin) headers.set("x-admin", "true");
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return { ...init, headers };
}

async function handle(resp) {
  const isJson = resp.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await resp.json() : await resp.text();
  if (!resp.ok) {
    const detail = body?.detail || body?.message || resp.statusText;
    throw new Error(detail);
  }
  return body;
}

export const api = {
  async get(path, { params } = {}) {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    const resp = await fetch(`${BASE_URL}${path}${qs}`, withHeaders({ method: "GET" }));
    return { data: await handle(resp) };
  },
  async post(path, data) {
    const resp = await fetch(`${BASE_URL}${path}`, withHeaders({ method: "POST", body: JSON.stringify(data) }));
    return { data: await handle(resp) };
  },
  async del(path) {
    const resp = await fetch(`${BASE_URL}${path}`, withHeaders({ method: "DELETE" }));
    return { data: await handle(resp) };
  },
  async put(path, data) {
    const resp = await fetch(`${BASE_URL}${path}`, withHeaders({ method: "PUT", body: JSON.stringify(data) }));
    return { data: await handle(resp) };
  },
};

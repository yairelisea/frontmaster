import { api } from "@/lib/api";

// Tipos (comentario): 
// Campaign { id, name, query, size, days_back, city_keywords: string[],
//           lang, country, userId, createdAt }

export async function listCampaigns() {
  const { data } = await api.get("/campaigns");
  return data;
}

export async function getCampaign(id) {
  const { data } = await api.get(`/campaigns/${id}`);
  return data;
}

export async function createCampaign(payload) {
  // payload: { name, query, size?, days_back?, city_keywords?, lang?, country? }
  const { data } = await api.post("/campaigns", payload);
  return data;
}

export async function updateCampaign(id, payload) {
  const { data } = await api.put(`/campaigns/${id}`, payload);
  return data;
}

export async function deleteCampaign(id) {
  const { data } = await api.delete(`/campaigns/${id}`);
  return data;
}
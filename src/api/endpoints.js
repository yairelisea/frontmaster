// src/api/endpoints.js
export const API_BASE =
  (window?.__API_BASE__) ||
  (import.meta?.env?.VITE_API_URL) ||
  "/api";

const E = (p) => `${API_BASE}${p}`;

/**
 * Rutas reales según tu OpenAPI actual:
 *  GET  /health
 *  POST /auth/login
 *  GET  /campaigns
 *  POST /campaigns
 *  GET  /campaigns/{campaign_id}
 *  POST /sources/campaigns/{campaign_id}/sources
 *  POST /ingest/ingest
 *  POST /analyses/ingest
 *  GET  /news/news
 *  GET  /ai/analyze-news
 *  POST /reports/pdf
 *  POST /search-local/campaign/{campaign_id}
 *  POST /search-local
 *  POST /analyses/process_pending   (?campaignId=&limit=)
 */
export const endpoints = {
  // meta
  health: () => E(`/health`),

  // auth
  login: () => E(`/auth/login`),

  // campaigns
  campaigns:     ()    => E(`/campaigns`),
  campaignById:  (id)  => E(`/campaigns/${id}`),

  // sources
  addSource:     (campaignId) => E(`/sources/campaigns/${campaignId}/sources`),

  // ingest / local / analyses
  ingest:        ()    => E(`/ingest/ingest`),
  searchLocal:   ()    => E(`/search-local`),
  searchLocalForCampaign: (id) => E(`/search-local/campaign/${id}`),
  analysesProcessPending: (campaignId, limit=200) => {
    const qs = new URLSearchParams();
    if (campaignId) qs.set('campaignId', campaignId);
    if (limit) qs.set('limit', String(limit));
    return E(`/analyses/process_pending?${qs.toString()}`);
  },

  // news / ai
  newsSearch:    () => E(`/news/news`),
  aiAnalyzeNews: () => E(`/ai/analyze-news`),

  // reports
  reportPdf:     () => E(`/reports/pdf`),
};

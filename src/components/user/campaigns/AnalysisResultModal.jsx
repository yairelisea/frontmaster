// src/components/user/campaigns/AnalysisResultModal.jsx
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function AnalysisResultModal({ open, onOpenChange, result, campaignName }) {
  if (!result) return null;

  const {
    summary,
    sentiment_label,
    sentiment_score,
    topics = [],
    perception = {},
    items = [],
    raw, // guardamos la respuesta completa por si algo no mapea
  } = result;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Análisis IA – {campaignName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <section>
            <h4 className="font-semibold mb-1">Resumen</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {summary || "—"}
            </p>
          </section>

          <section className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-1">Sentimiento</h4>
              <p className="text-sm">
                {sentiment_label ?? "—"}
                {typeof sentiment_score === "number" ? ` (${sentiment_score.toFixed(2)})` : ""}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Temas</h4>
              <div className="flex flex-wrap gap-2">
                {topics.length > 0 ? topics.map((t, i) => (
                  <Badge key={i} variant="secondary">{t}</Badge>
                )) : <span className="text-sm text-muted-foreground">—</span>}
              </div>
            </div>
          </section>

          <section>
            <h4 className="font-semibold mb-1">Percepción</h4>
            <pre className="text-xs bg-muted/40 p-3 rounded-md overflow-x-auto">
              {JSON.stringify(perception ?? {}, null, 2)}
            </pre>
          </section>

          {items.length > 0 && (
            <section>
              <h4 className="font-semibold mb-2">Artículos analizados</h4>
              <div className="space-y-2 max-h-60 overflow-auto pr-1">
                {items.map((it, idx) => (
                  <div key={idx} className="rounded border p-2 text-sm">
                    <div className="font-medium">{it.title || it.headline || `Artículo #${idx + 1}`}</div>
                    {it.url && (
                      <a href={it.url} target="_blank" className="text-xs text-blue-600 underline break-all">
                        {it.url}
                      </a>
                    )}
                    {it.sentiment_label && (
                      <div className="text-xs mt-1">
                        Sentimiento: {it.sentiment_label}{typeof it.sentiment_score === "number" ? ` (${it.sentiment_score.toFixed(2)})` : ""}
                      </div>
                    )}
                    {Array.isArray(it.topics) && it.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {it.topics.map((t,i) => <Badge key={i} variant="outline">{t}</Badge>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Depuración opcional */}
          {!summary && items.length === 0 && raw && (
            <section>
              <h4 className="font-semibold mb-1">Respuesta original</h4>
              <pre className="text-xs bg-muted/40 p-3 rounded-md overflow-x-auto">
                {JSON.stringify(raw, null, 2)}
              </pre>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
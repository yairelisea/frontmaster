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
    topics,
    perception,
  } = result;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Análisis IA – {campaignName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-1">Resumen</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{summary || "—"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-1">Sentimiento</h4>
              <p className="text-sm">
                {sentiment_label ?? "—"}{typeof sentiment_score === "number" ? ` (${sentiment_score.toFixed(2)})` : ""}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Temas</h4>
              <div className="flex flex-wrap gap-2">
                {(topics ?? []).map((t, i) => (
                  <Badge key={i} variant="secondary">{t}</Badge>
                ))}
                {(!topics || topics.length === 0) && <span className="text-sm text-muted-foreground">—</span>}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Percepción</h4>
            <pre className="text-xs bg-muted/40 p-3 rounded-md overflow-x-auto">
              {JSON.stringify(perception ?? {}, null, 2)}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

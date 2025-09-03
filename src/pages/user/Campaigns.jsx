import { useState } from "react";
import CampaignList from "@/components/CampaignList";
import CampaignForm from "@/components/CampaignForm";
import CampaignDetail from "@/components/CampaignDetail";

export default function CampaignsPage() {
  const [mode, setMode] = useState("list"); // list | new | detail
  const [current, setCurrent] = useState(null); // campaña seleccionada

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Campañas</h1>

      {mode === "list" && (
        <CampaignList
          onOpen={(c) => { setCurrent(c); setMode("detail"); }}
          onOpenNew={() => setMode("new")}
        />
      )}

      {mode === "new" && (
        <CampaignForm
          initial={null}
          onSaved={(c) => { setCurrent(c); setMode("detail"); }}
          onCancel={() => setMode("list")}
        />
      )}

      {mode === "detail" && current?.id && (
        <CampaignDetail campaignId={current.id} />
      )}
    </div>
  );
}
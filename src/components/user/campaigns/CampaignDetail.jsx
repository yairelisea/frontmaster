import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import CampaignTable from "@/components/user/campaigns/CampaignTable"; // tu tabla actual
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function UserCampaignsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("campaigns"); // ← sin slash inicial
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis campañas</h1>
        <Button onClick={() => nav("/user/campaigns/new")}>Nueva campaña</Button>
      </div>

      <CampaignTable
        campaigns={rows}
        allCampaignsCount={rows.length}
        onOpenNewForm={() => nav("/user/campaigns/new")}
        onEdit={(c) => nav(`/user/campaigns/edit/${c.id}`)}
        onToggleStatus={() => {}}
        onDelete={() => {}}
      />
    </div>
  );
}
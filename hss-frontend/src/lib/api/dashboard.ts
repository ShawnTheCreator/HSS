import api from "./client";

export const getStats = async () => {
  const { data } = await api.get("/auth/dashboard/stats");
  return data as {
    totalStaff: number;
    activeShifts: number;
    pendingApprovals: number;
    compliance: { valid: number; invalid: number };
  };
};

export const getAlerts = async () => {
  const { data } = await api.get("/auth/dashboard/alerts");
  return data as Array<{ id: string; title: string; description: string; level: string }>;
};

export const getShifts = async () => {
  const { data } = await api.get("/auth/dashboard/shifts");
  return data as Array<{ id: string; name: string; start: string; end: string; role: string; avatarUrl?: string | null }>;
};

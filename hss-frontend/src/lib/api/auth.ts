import api from "./client";

export type LoginPayload = {
  email_id: string;
  password: string;
  recaptcha_token: string;
};

export const login = async (payload: LoginPayload) => {
  const { data } = await api.post("/auth/login", payload);
  return data as { success: boolean; message?: string; token?: string };
};

export const register = async (payload: Record<string, unknown>) => {
  const { data } = await api.post("/auth/register", payload);
  return data as { success: boolean; message?: string };
};

export const geocode = async (address: string) => {
  const { data } = await api.post("/auth/geocode", { address });
  return data as { success: boolean; location: { lat: number; lng: number } };
};

export const me = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const logout = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};

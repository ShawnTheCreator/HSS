import api from "./client";

export const reverseGeocode = async (lat: number, lon: number) => {
  const { data } = await api.post("/geocode", { lat, lon });
  return data as { address: Record<string, string> };
};

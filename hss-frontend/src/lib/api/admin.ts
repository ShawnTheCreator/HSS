import api from "./client";

export const listUsers = async () => {
  const { data } = await api.get("/auth/admin/users");
  return data as Array<any>;
};

export const updateApproval = async (id: string, action: "approve" | "reject" | "unapprove") => {
  const { data } = await api.patch(`/auth/admin/users/${id}/${action}`);
  return data as { success: boolean; message?: string };
};

import api from "../api/axios";

export const adminService = {
  seed: () => api.post("/admin/seed"),
};

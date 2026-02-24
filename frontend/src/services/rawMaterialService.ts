import api from "../api/axios";
import { PageResponse } from "./productService";

export interface RawMaterial {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export interface RawMaterialRequest {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  unit: string;
}

export const rawMaterialService = {
  list: (page = 0, size = 10, search?: string) =>
    api.get<PageResponse<RawMaterial>>("/raw-materials", {
      params: { page, size, search },
    }),

  listAll: () => api.get<RawMaterial[]>("/raw-materials/all"),

  getById: (id: string) => api.get<RawMaterial>(`/raw-materials/${id}`),

  create: (data: RawMaterialRequest) =>
    api.post<RawMaterial>("/raw-materials", data),

  update: (id: string, data: RawMaterialRequest) =>
    api.put<RawMaterial>(`/raw-materials/${id}`, data),

  delete: (id: string) => api.delete(`/raw-materials/${id}`),
};

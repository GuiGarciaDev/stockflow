import { api } from "@/services/api"
import type { PageResponse } from "@/services/types"

export type RawMaterial = {
  id: string
  name: string
  description?: string | null
  price: number
  stockQuantity: number
  unit: string
  createdAt: string
  updatedAt: string
}

export type RawMaterialRequest = {
  name: string
  description?: string
  price: number
  stockQuantity: number
  unit: string
}

export const rawMaterialService = {
  async list(params: { page: number; size: number; search?: string | null }) {
    const res = await api.get<PageResponse<RawMaterial>>("/raw-materials", {
      params: {
        page: params.page,
        size: params.size,
        search: params.search || undefined,
      },
    })
    return res.data
  },
  async listAll() {
    const res = await api.get<RawMaterial[]>("/raw-materials/all")
    return res.data
  },
  async get(id: string) {
    const res = await api.get<RawMaterial>(`/raw-materials/${id}`)
    return res.data
  },
  async create(body: RawMaterialRequest) {
    const res = await api.post<RawMaterial>("/raw-materials", body)
    return res.data
  },
  async update(id: string, body: RawMaterialRequest) {
    const res = await api.put<RawMaterial>(`/raw-materials/${id}`, body)
    return res.data
  },
  async remove(id: string) {
    await api.delete(`/raw-materials/${id}`)
  },
}

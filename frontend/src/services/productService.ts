import { api } from "@/services/api"
import type { PageResponse } from "@/services/types"

export type ProductRawMaterialAssociation = {
  id: string
  rawMaterialId: string
  rawMaterialName: string
  quantityNeeded: number
  rawMaterialStockQuantity?: number
  rawMaterialUnit?: string
}

export type Product = {
  id: string
  name: string
  description?: string | null
  price: number
  stockQuantity: number
  rawMaterials?: ProductRawMaterialAssociation[]
  createdAt: string
  updatedAt: string
}

export type ProductRequest = {
  name: string
  description?: string
  price: number
  stockQuantity: number
}

export type ProductRawMaterialRequest = {
  rawMaterialId: string
  quantityNeeded: number
}

export const productService = {
  async list(params: { page: number; size: number; search?: string | null }) {
    const res = await api.get<PageResponse<Product>>("/products", {
      params: {
        page: params.page,
        size: params.size,
        search: params.search || undefined,
      },
    })
    return res.data
  },
  async get(id: string) {
    const res = await api.get<Product>(`/products/${id}`)
    return res.data
  },
  async create(body: ProductRequest) {
    const res = await api.post<Product>("/products", body)
    return res.data
  },
  async update(id: string, body: ProductRequest) {
    const res = await api.put<Product>(`/products/${id}`, body)
    return res.data
  },
  async remove(id: string) {
    await api.delete(`/products/${id}`)
  },
  async addRawMaterial(productId: string, body: ProductRawMaterialRequest) {
    const res = await api.post<Product>(
      `/products/${productId}/raw-materials`,
      [body],
    )
    return res.data
  },
  async addRawMaterials(
    productId: string,
    bodies: ProductRawMaterialRequest[],
  ) {
    const res = await api.post<Product>(
      `/products/${productId}/raw-materials`,
      bodies,
    )
    return res.data
  },
  async updateRawMaterial(
    productId: string,
    associationId: string,
    body: ProductRawMaterialRequest,
  ) {
    const res = await api.put<Product>(
      `/products/${productId}/raw-materials/${associationId}`,
      body,
    )
    return res.data
  },
  async removeRawMaterial(productId: string, associationId: string) {
    const res = await api.delete<Product>(
      `/products/${productId}/raw-materials/${associationId}`,
    )
    return res.data
  },
}

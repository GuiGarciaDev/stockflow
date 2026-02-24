import api from "../api/axios";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  rawMaterials: RawMaterialAssociation[];
  createdAt: string;
  updatedAt: string;
}

export interface RawMaterialAssociation {
  id: string;
  rawMaterialId: string;
  rawMaterialName: string;
  quantityNeeded: number;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
}

export interface ProductRawMaterialRequest {
  rawMaterialId: string;
  quantityNeeded: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export const productService = {
  list: (page = 0, size = 10, search?: string) =>
    api.get<PageResponse<Product>>("/products", {
      params: { page, size, search },
    }),

  getById: (id: string) => api.get<Product>(`/products/${id}`),

  create: (data: ProductRequest) => api.post<Product>("/products", data),

  update: (id: string, data: ProductRequest) =>
    api.put<Product>(`/products/${id}`, data),

  delete: (id: string) => api.delete(`/products/${id}`),

  addRawMaterial: (productId: string, data: ProductRawMaterialRequest) =>
    api.post<Product>(`/products/${productId}/raw-materials`, data),

  removeRawMaterial: (productId: string, associationId: string) =>
    api.delete<Product>(
      `/products/${productId}/raw-materials/${associationId}`,
    ),

  updateRawMaterialQty: (
    productId: string,
    associationId: string,
    data: ProductRawMaterialRequest,
  ) =>
    api.put<Product>(
      `/products/${productId}/raw-materials/${associationId}`,
      data,
    ),
};

import { api } from "@/services/api"

export type ProductionSuggestion = {
  productId: string
  productName: string
  quantityPossible: number
  unitPrice: number
  totalValue: number
}

export type ProductionResponse = {
  products: ProductionSuggestion[]
  grandTotalValue: number
}

export type ProductionCreateRequest = {
  productId: string
  quantity: number
}

export type ProductionCreateResponse = {
  productId: string
  quantityRequested: number
  quantityCreated: number
  maxQuantityPossible: number
  newProductStockQuantity: number
}

export const productionService = {
  async suggestions() {
    const res = await api.get<ProductionResponse>("/production/suggestions")
    return res.data
  },

  async create(body: ProductionCreateRequest) {
    const res = await api.post<ProductionCreateResponse>(
      "/production/create",
      body,
    )
    return res.data
  },
}

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

export const productionService = {
  async suggestions() {
    const res = await api.get<ProductionResponse>("/production/suggestions")
    return res.data
  },
}

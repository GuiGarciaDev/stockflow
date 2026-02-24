import api from "../api/axios";

export interface ProductionSuggestion {
  productId: string;
  productName: string;
  quantityPossible: number;
  unitPrice: number;
  totalValue: number;
}

export interface ProductionResponse {
  products: ProductionSuggestion[];
  grandTotalValue: number;
}

export const productionService = {
  getSuggestions: () => api.get<ProductionResponse>("/production/suggestions"),
  confirmProduction: () => api.post<ProductionResponse>("/production/confirm"),
};

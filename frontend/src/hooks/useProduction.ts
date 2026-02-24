import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productionService } from "../services/productionService";
import toast from "react-hot-toast";

export function useProductionSuggestions() {
  return useQuery({
    queryKey: ["production", "suggestions"],
    queryFn: () => productionService.getSuggestions().then((r) => r.data),
  });
}

export function useConfirmProduction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => productionService.confirmProduction().then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["production"] });
      qc.invalidateQueries({ queryKey: ["rawMaterials"] });
      toast.success("Production confirmed! Stock has been deducted.");
    },
    onError: () => toast.error("Failed to confirm production"),
  });
}

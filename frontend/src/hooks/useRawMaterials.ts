import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  rawMaterialService,
  RawMaterialRequest,
} from "../services/rawMaterialService";
import toast from "react-hot-toast";

export function useRawMaterials(page = 0, size = 10, search?: string) {
  return useQuery({
    queryKey: ["rawMaterials", page, size, search],
    queryFn: () =>
      rawMaterialService.list(page, size, search).then((r) => r.data),
  });
}

export function useAllRawMaterials() {
  return useQuery({
    queryKey: ["rawMaterials", "all"],
    queryFn: () => rawMaterialService.listAll().then((r) => r.data),
  });
}

export function useCreateRawMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RawMaterialRequest) =>
      rawMaterialService.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rawMaterials"] });
      toast.success("Raw material created successfully");
    },
    onError: () => toast.error("Failed to create raw material"),
  });
}

export function useUpdateRawMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RawMaterialRequest }) =>
      rawMaterialService.update(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rawMaterials"] });
      toast.success("Raw material updated successfully");
    },
    onError: () => toast.error("Failed to update raw material"),
  });
}

export function useDeleteRawMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rawMaterialService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rawMaterials"] });
      toast.success("Raw material deleted successfully");
    },
    onError: () => toast.error("Failed to delete raw material"),
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  productService,
  ProductRequest,
  ProductRawMaterialRequest,
} from "../services/productService";
import toast from "react-hot-toast";

export function useProducts(page = 0, size = 10, search?: string) {
  return useQuery({
    queryKey: ["products", page, size, search],
    queryFn: () => productService.list(page, size, search).then((r) => r.data),
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getById(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductRequest) =>
      productService.create(data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
    },
    onError: () => toast.error("Failed to create product"),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductRequest }) =>
      productService.update(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product"] });
      toast.success("Product updated successfully");
    },
    onError: () => toast.error("Failed to update product"),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully");
    },
    onError: () => toast.error("Failed to delete product"),
  });
}

export function useAddRawMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: number;
      data: ProductRawMaterialRequest;
    }) => productService.addRawMaterial(productId, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product"] });
      toast.success("Raw material added");
    },
    onError: () => toast.error("Failed to add raw material"),
  });
}

export function useRemoveRawMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      associationId,
    }: {
      productId: number;
      associationId: number;
    }) => productService.removeRawMaterial(productId, associationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product"] });
      toast.success("Raw material removed");
    },
    onError: () => toast.error("Failed to remove raw material"),
  });
}

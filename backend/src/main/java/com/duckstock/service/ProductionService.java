package com.duckstock.service;

import com.duckstock.dto.production.ProductionResponse;
import com.duckstock.dto.production.ProductionSuggestion;
import com.duckstock.entity.Product;
import com.duckstock.entity.ProductRawMaterial;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@ApplicationScoped
public class ProductionService {

    /**
     * Production suggestion logic:
     * 1. Sort all products by price DESC (most valuable first)
     * 2. For each product, calculate max quantity producible based on current virtual stock
     * 3. Deduct used raw materials from virtual stock
     * 4. Return suggestions with quantities, prices, and grand total
     */
    public ProductionResponse getSuggestions() {
        // Get all products sorted by price DESC
        List<Product> products = Product.findAll(Sort.descending("price")).list();

        // Build virtual stock map: rawMaterialId -> available quantity
        Map<UUID, Integer> virtualStock = new HashMap<>();
        for (Product product : products) {
            if (product.rawMaterials != null) {
                for (ProductRawMaterial prm : product.rawMaterials) {
                    virtualStock.putIfAbsent(prm.rawMaterial.id, prm.rawMaterial.stockQuantity);
                }
            }
        }

        List<ProductionSuggestion> suggestions = new ArrayList<>();
        BigDecimal grandTotal = BigDecimal.ZERO;

        for (Product product : products) {
            if (product.rawMaterials == null || product.rawMaterials.isEmpty()) {
                continue; // Skip products without raw material associations
            }

            // Calculate max quantity possible for this product
            int maxQuantity = Integer.MAX_VALUE;
            for (ProductRawMaterial prm : product.rawMaterials) {
                int available = virtualStock.getOrDefault(prm.rawMaterial.id, 0);
                int possibleFromThis = available / prm.quantityNeeded;
                maxQuantity = Math.min(maxQuantity, possibleFromThis);
            }

            if (maxQuantity <= 0 || maxQuantity == Integer.MAX_VALUE) {
                continue; // Skip if can't produce any
            }

            // Deduct from virtual stock
            for (ProductRawMaterial prm : product.rawMaterials) {
                int current = virtualStock.getOrDefault(prm.rawMaterial.id, 0);
                virtualStock.put(prm.rawMaterial.id, current - (prm.quantityNeeded * maxQuantity));
            }

            BigDecimal totalValue = product.price.multiply(BigDecimal.valueOf(maxQuantity));
            grandTotal = grandTotal.add(totalValue);

            suggestions.add(new ProductionSuggestion(
                    product.id,
                    product.name,
                    maxQuantity,
                    product.price,
                    totalValue
            ));
        }

        return new ProductionResponse(suggestions, grandTotal);
    }

    /**
     * Confirm production: actually deduct stock from raw materials
     */
    @jakarta.transaction.Transactional
    public ProductionResponse confirmProduction() {
        ProductionResponse suggestions = getSuggestions();

        // Now actually deduct stock
        List<Product> products = Product.findAll(Sort.descending("price")).list();
        Map<UUID, Integer> deductions = new HashMap<>();

        for (ProductionSuggestion suggestion : suggestions.products) {
            Product product = products.stream()
                    .filter(p -> p.id.equals(suggestion.productId))
                    .findFirst()
                    .orElse(null);

            if (product == null || product.rawMaterials == null) continue;

            for (ProductRawMaterial prm : product.rawMaterials) {
                deductions.merge(prm.rawMaterial.id,
                        prm.quantityNeeded * suggestion.quantityPossible,
                        Integer::sum);
            }
        }

        // Apply deductions
        for (Map.Entry<UUID, Integer> entry : deductions.entrySet()) {
            com.duckstock.entity.RawMaterial rm =
                    com.duckstock.entity.RawMaterial.findById(entry.getKey());
            if (rm != null) {
                rm.stockQuantity = Math.max(0, rm.stockQuantity - entry.getValue());
                rm.persist();
            }
        }

        return suggestions;
    }
}

package com.duckstock.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.duckstock.dto.production.ProductionCreateRequest;
import com.duckstock.dto.production.ProductionCreateResponse;
import com.duckstock.dto.production.ProductionResponse;
import com.duckstock.dto.production.ProductionSuggestion;
import com.duckstock.entity.Product;
import com.duckstock.entity.ProductRawMaterial;
import com.duckstock.exception.BusinessException;
import com.duckstock.exception.ResourceNotFoundException;

import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

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
     * Create product units: deduct raw materials and add to product stock.
     *
     * Admin-only endpoint will call this.
     */
    @jakarta.transaction.Transactional
    public ProductionCreateResponse createProduct(ProductionCreateRequest request) {
        if (request == null) {
            throw new BusinessException("Request body is required");
        }
        if (request.productId == null) {
            throw new BusinessException("Product ID is required");
        }
        if (request.quantity <= 0) {
            throw new BusinessException("Quantity must be at least 1");
        }

        Product product = Product.findById(request.productId);
        if (product == null) {
            throw new ResourceNotFoundException("Product not found");
        }

        List<ProductRawMaterial> rawMaterials = ProductRawMaterial.findByProduct(product);
        if (rawMaterials == null || rawMaterials.isEmpty()) {
            throw new BusinessException("This product has no raw materials linked");
        }

        int maxQuantityPossible = Integer.MAX_VALUE;
        for (ProductRawMaterial prm : rawMaterials) {
            int neededPerUnit = prm.quantityNeeded;
            if (neededPerUnit <= 0) {
                throw new BusinessException("Invalid product composition: quantityNeeded must be at least 1");
            }

            int possibleFromThis = prm.rawMaterial.stockQuantity / neededPerUnit;
            maxQuantityPossible = Math.min(maxQuantityPossible, possibleFromThis);
        }

        if (maxQuantityPossible <= 0 || maxQuantityPossible == Integer.MAX_VALUE) {
            throw new BusinessException("Insufficient raw materials to produce this product");
        }

        int quantityToProduce = Math.min(request.quantity, maxQuantityPossible);
        if (quantityToProduce <= 0) {
            throw new BusinessException("Nothing to produce");
        }

        // Deduct raw materials
        for (ProductRawMaterial prm : rawMaterials) {
            int deduction = prm.quantityNeeded * quantityToProduce;
            prm.rawMaterial.stockQuantity = Math.max(0, prm.rawMaterial.stockQuantity - deduction);
            prm.rawMaterial.persist();
        }

        // Increase product stock
        product.stockQuantity = product.stockQuantity + quantityToProduce;
        product.persist();

        return new ProductionCreateResponse(
                product.id,
                request.quantity,
                quantityToProduce,
                maxQuantityPossible,
                product.stockQuantity
        );
    }
}

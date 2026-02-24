package com.duckstock.service;

import com.duckstock.dto.common.PageResponse;
import com.duckstock.dto.product.ProductRawMaterialRequest;
import com.duckstock.dto.product.ProductRequest;
import com.duckstock.dto.product.ProductResponse;
import com.duckstock.entity.Product;
import com.duckstock.entity.ProductRawMaterial;
import com.duckstock.entity.RawMaterial;
import com.duckstock.exception.BusinessException;
import com.duckstock.exception.ResourceNotFoundException;
import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@ApplicationScoped
public class ProductService {

    public PageResponse<ProductResponse> listAll(int page, int size, String search) {
        PanacheQuery<Product> query;

        if (search != null && !search.isBlank()) {
            query = Product.find("LOWER(name) LIKE LOWER(?1)", Sort.descending("createdAt"),
                    "%" + search.trim() + "%");
        } else {
            query = Product.findAll(Sort.descending("createdAt"));
        }

        long totalElements = query.count();
        List<ProductResponse> content = query.page(Page.of(page, size))
                .list()
                .stream()
                .map(ProductResponse::from)
                .collect(Collectors.toList());

        return new PageResponse<>(content, page, size, totalElements);
    }

    public ProductResponse findById(UUID id) {
        Product product = Product.findById(id);
        if (product == null) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        return ProductResponse.from(product);
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product product = new Product();
        product.name = request.name;
        product.description = request.description;
        product.price = request.price;
        product.stockQuantity = request.stockQuantity;
        product.persist();
        return ProductResponse.from(product);
    }

    @Transactional
    public ProductResponse update(UUID id, ProductRequest request) {
        Product product = Product.findById(id);
        if (product == null) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        
        if (request.name != null) {
            product.name = request.name;
        }
        if (request.description != null) {
            product.description = request.description;
        }
        if (request.price != null) {
            product.price = request.price;
        }
        if (request.stockQuantity != null) {
            product.stockQuantity = request.stockQuantity;
        }
        
        product.persist();
        return ProductResponse.from(product);
    }

    @Transactional
    public void delete(UUID id) {
        Product product = Product.findById(id);
        if (product == null) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        product.delete();
    }

    @Transactional
    public ProductResponse addRawMaterial(UUID productId, ProductRawMaterialRequest request) {
        Product product = Product.findById(productId);
        if (product == null) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }

        RawMaterial rawMaterial = RawMaterial.findById(request.rawMaterialId);
        if (rawMaterial == null) {
            throw new ResourceNotFoundException("Raw material not found with id: " + request.rawMaterialId);
        }

        // Check if association already exists
        boolean exists = product.rawMaterials != null && product.rawMaterials.stream()
                .anyMatch(prm -> prm.rawMaterial.id.equals(request.rawMaterialId));
        if (exists) {
            throw new BusinessException("Raw material is already associated with this product");
        }

        ProductRawMaterial prm = new ProductRawMaterial();
        prm.product = product;
        prm.rawMaterial = rawMaterial;
        prm.quantityNeeded = request.quantityNeeded;
        prm.persist();

        // Manage bidirectional relationship for immediate visibility in response
        if (product.rawMaterials == null) {
            product.rawMaterials = new java.util.ArrayList<>();
        }
        product.rawMaterials.add(prm);

        return ProductResponse.from(product);
    }

    @Transactional
    public ProductResponse removeRawMaterial(UUID productId, UUID associationId) {
        Product product = Product.findById(productId);
        if (product == null) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }

        ProductRawMaterial prm = ProductRawMaterial.findById(associationId);
        if (prm == null || !prm.product.id.equals(productId)) {
            throw new ResourceNotFoundException("Association not found");
        }

        prm.delete();
        if (product.rawMaterials != null) {
            product.rawMaterials.remove(prm);
        }
        return ProductResponse.from(product);
    }

    @Transactional
    public ProductResponse updateRawMaterialQuantity(UUID productId, UUID associationId,
                                                      ProductRawMaterialRequest request) {
        Product product = Product.findById(productId);
        if (product == null) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }

        ProductRawMaterial prm = ProductRawMaterial.findById(associationId);
        if (prm == null || !prm.product.id.equals(productId)) {
            throw new ResourceNotFoundException("Association not found");
        }

        prm.quantityNeeded = request.quantityNeeded;
        prm.persist();

        Product.getEntityManager().refresh(product);
        return ProductResponse.from(product);
    }
}

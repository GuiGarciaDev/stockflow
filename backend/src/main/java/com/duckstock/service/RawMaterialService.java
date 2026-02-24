package com.duckstock.service;

import com.duckstock.dto.common.PageResponse;
import com.duckstock.dto.rawmaterial.RawMaterialRequest;
import com.duckstock.dto.rawmaterial.RawMaterialResponse;
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
public class RawMaterialService {

    public PageResponse<RawMaterialResponse> listAll(int page, int size, String search) {
        PanacheQuery<RawMaterial> query;

        if (search != null && !search.isBlank()) {
            query = RawMaterial.find("LOWER(name) LIKE LOWER(?1)", Sort.descending("createdAt"),
                    "%" + search.trim() + "%");
        } else {
            query = RawMaterial.findAll(Sort.descending("createdAt"));
        }

        long totalElements = query.count();
        List<RawMaterialResponse> content = query.page(Page.of(page, size))
                .list()
                .stream()
                .map(RawMaterialResponse::from)
                .collect(Collectors.toList());

        return new PageResponse<>(content, page, size, totalElements);
    }

    public RawMaterialResponse findById(UUID id) {
        RawMaterial rawMaterial = RawMaterial.findById(id);
        if (rawMaterial == null) {
            throw new ResourceNotFoundException("Raw material not found with id: " + id);
        }
        return RawMaterialResponse.from(rawMaterial);
    }

    @Transactional
    public RawMaterialResponse create(RawMaterialRequest request) {
        RawMaterial rawMaterial = new RawMaterial();
        rawMaterial.name = request.name;
        rawMaterial.description = request.description;
        rawMaterial.price = request.price;
        rawMaterial.stockQuantity = request.stockQuantity;
        rawMaterial.unit = request.unit;
        rawMaterial.persist();
        return RawMaterialResponse.from(rawMaterial);
    }

    @Transactional
    public RawMaterialResponse update(UUID id, RawMaterialRequest request) {
        RawMaterial rawMaterial = RawMaterial.findById(id);
        if (rawMaterial == null) {
            throw new ResourceNotFoundException("Raw material not found with id: " + id);
        }
        
        if (request.name != null) {
            rawMaterial.name = request.name;
        }
        if (request.description != null) {
            rawMaterial.description = request.description;
        }
        if (request.price != null) {
            rawMaterial.price = request.price;
        }
        if (request.stockQuantity != null) {
            rawMaterial.stockQuantity = request.stockQuantity;
        }
        if (request.unit != null) {
            rawMaterial.unit = request.unit;
        }
        
        rawMaterial.persist();
        return RawMaterialResponse.from(rawMaterial);
    }

    @Transactional
    public void delete(UUID id) {
        RawMaterial rawMaterial = RawMaterial.findById(id);
        if (rawMaterial == null) {
            throw new ResourceNotFoundException("Raw material not found with id: " + id);
        }
        rawMaterial.delete();
    }

    public List<RawMaterialResponse> listAllNoPagination() {
        return RawMaterial.findAll(Sort.ascending("name"))
                .list()
                .stream()
                .map(rm -> RawMaterialResponse.from((RawMaterial) rm))
                .collect(Collectors.toList());
    }
}

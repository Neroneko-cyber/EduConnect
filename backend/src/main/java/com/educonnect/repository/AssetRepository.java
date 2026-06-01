package com.educonnect.repository;

import com.educonnect.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, java.util.UUID> {
    List<Asset> findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase(String name, String code);
}
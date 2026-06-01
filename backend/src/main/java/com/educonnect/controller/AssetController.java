package com.educonnect.controller;

import com.educonnect.asset.dto.ForwardTicketRequest;
import com.educonnect.asset.dto.KepsekRespondRequest;
import com.educonnect.asset.dto.TuRespondRequest;
import com.educonnect.entity.Asset;
import com.educonnect.entity.AssetTicket;
import com.educonnect.service.AssetService;
import com.educonnect.service.DocumentExportService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private final AssetService assetService;
    private final DocumentExportService documentExportService;

    public AssetController(AssetService assetService, DocumentExportService documentExportService) {
        this.assetService = assetService;
        this.documentExportService = documentExportService;
    }

    @GetMapping
    public ResponseEntity<List<Asset>> getAllAssets() {
        return ResponseEntity.ok(assetService.getAllAssets());
    }

    @PostMapping
    public ResponseEntity<Asset> createAsset(@RequestBody Asset asset) {
        Asset saved = assetService.createAsset(asset);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Asset>> searchAssets(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(assetService.searchAssets(keyword));
    }

    @GetMapping("/tickets")
    public ResponseEntity<List<AssetTicket>> getAllTickets() {
        return ResponseEntity.ok(assetService.getAllTickets());
    }

    @GetMapping("/tickets/reporter/{reporterId}")
    public ResponseEntity<List<AssetTicket>> getTicketsByReporter(@PathVariable java.util.UUID reporterId) {
        return ResponseEntity.ok(assetService.getTicketsByReporter(reporterId));
    }

    @PostMapping("/tickets")
    public ResponseEntity<AssetTicket> reportBrokenAsset(
            @RequestParam java.util.UUID assetId,
            @RequestParam java.util.UUID reporterId,
            @RequestParam String description,
            @RequestParam(required = false) MultipartFile photo) throws IOException {
        AssetTicket ticket = assetService.reportBrokenAsset(assetId, reporterId, description, photo);
        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/tickets/{id}/forward")
    public ResponseEntity<AssetTicket> forwardToKepsek(@PathVariable java.util.UUID id, @RequestBody ForwardTicketRequest dto) {
        return ResponseEntity.ok(assetService.forwardToKepsek(id, dto.getEstimatedCost()));
    }

    @PutMapping("/tickets/{id}/kepsek-response")
    public ResponseEntity<AssetTicket> kepsekRespond(@PathVariable java.util.UUID id, @RequestBody KepsekRespondRequest dto) {
        return ResponseEntity.ok(assetService.kepsekRespond(id, dto.isApproved(), dto.getFeedback()));
    }

    @PutMapping("/tickets/{id}/tu-response")
    public ResponseEntity<AssetTicket> tuRespondToGuru(@PathVariable java.util.UUID id, @RequestBody TuRespondRequest dto) {
        return ResponseEntity.ok(assetService.tuRespondToGuru(id, dto.getFeedback()));
    }

    @GetMapping("/export/excel")
    public ResponseEntity<FileSystemResource> exportRecapExcel() throws Exception {
        File file = documentExportService.exportAssetRecapExcel();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=" + file.getName());

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new FileSystemResource(file));
    }

    @GetMapping("/export/ppt")
    public ResponseEntity<FileSystemResource> exportStatsPpt() throws Exception {
        File file = documentExportService.exportAssetStatsPptx();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=" + file.getName());

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.presentationml.presentation"))
                .body(new FileSystemResource(file));
    }
}
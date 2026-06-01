package com.educonnect.service;

import com.educonnect.entity.StudentGrade;
import com.educonnect.entity.User;
import com.educonnect.repository.StudentGradeRepository;
import com.educonnect.repository.UserRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.stream.Collectors;

import com.educonnect.entity.Asset;
import com.educonnect.entity.AssetCondition;
import com.educonnect.repository.AssetRepository;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextShape;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import com.educonnect.entity.Disposition;

@Service
@SuppressWarnings("null")
public class DocumentExportService {

    @Autowired
    private StudentGradeRepository studentGradeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AssetRepository assetRepository;

    public File exportRaporPdf(java.util.UUID studentId, String academicYear, String semester) throws Exception {
        Optional<User> studentOpt = userRepository.findById(studentId);
        if (studentOpt.isEmpty()) {
            throw new IllegalArgumentException("Siswa tidak ditemukan");
        }
        User student = studentOpt.get();

        List<StudentGrade> grades = studentGradeRepository.findByStudentIdAndAcademicYearAndSemester(studentId, academicYear, semester);

        String safeAcademicYear = academicYear.replace("/", "-");
        String dirPath = "rapor/" + safeAcademicYear + "/" + semester;
        File dir = new File(dirPath);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String className = student.getKelas() != null ? student.getKelas().getGradeClass() : "Unknown";
        String fileName = String.format("Rapor_%s_%s_%s.pdf", student.getName().replaceAll("\\s+", ""), className, semester);
        File pdfFile = new File(dir, fileName);

        Document document = new Document();
        PdfWriter.getInstance(document, new FileOutputStream(pdfFile));
        document.open();

        document.add(new Paragraph("Rapor Siswa EduConnect"));
        document.add(new Paragraph("Tahun Ajaran: " + academicYear));
        document.add(new Paragraph("Semester: " + semester));
        document.add(new Paragraph("Nama: " + student.getName()));
        document.add(new Paragraph("Kelas: " + className));
        document.add(new Paragraph("\nNilai Mata Pelajaran:"));

        for (StudentGrade grade : grades) {
            String gradeText = String.format("- %s : Harian(%.1f), UTS(%.1f), UAS(%.1f) => Akhir(%.1f)",
                    grade.getSubject(),
                    grade.getDailyScore() != null ? grade.getDailyScore() : 0.0,
                    grade.getUtsScore() != null ? grade.getUtsScore() : 0.0,
                    grade.getUasScore() != null ? grade.getUasScore() : 0.0,
                    grade.getFinalScore() != null ? grade.getFinalScore() : 0.0);
            document.add(new Paragraph(gradeText));
        }

        document.close();
        return pdfFile;
    }

    public File exportAssetRecapExcel() throws Exception {
        List<Asset> assets = assetRepository.findAll();
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Asset Recap");

        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("ID");
        header.createCell(1).setCellValue("Kode");
        header.createCell(2).setCellValue("Nama Aset");
        header.createCell(3).setCellValue("Kondisi");
        header.createCell(4).setCellValue("Lokasi");

        int rowNum = 1;
        for (Asset asset : assets) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(asset.getId() != null ? asset.getId().toString() : "");
            row.createCell(1).setCellValue(asset.getCode());
            row.createCell(2).setCellValue(asset.getName());
            row.createCell(3).setCellValue(asset.getCondition().name());
            row.createCell(4).setCellValue(asset.getLocation());
        }

        File excelFile = File.createTempFile("AssetRecap_", ".xlsx");
        try (FileOutputStream fos = new FileOutputStream(excelFile)) {
            workbook.write(fos);
        }
        workbook.close();
        return excelFile;
    }

    public File exportAssetStatsPptx() throws Exception {
        List<Asset> assets = assetRepository.findAll();
        Map<AssetCondition, Long> stats = assets.stream()
                .collect(Collectors.groupingBy(Asset::getCondition, Collectors.counting()));

        long total = assets.size();
        long good = stats.getOrDefault(AssetCondition.GOOD, 0L);
        long broken = stats.getOrDefault(AssetCondition.BROKEN, 0L);
        long inRepair = stats.getOrDefault(AssetCondition.IN_REPAIR, 0L);

        XMLSlideShow ppt = new XMLSlideShow();
        XSLFSlide slide = ppt.createSlide();

        XSLFTextShape title = slide.createTextBox();
        title.setAnchor(new java.awt.Rectangle(50, 50, 600, 50));
        title.setText("Statistik Sarpras EduConnect");

        XSLFTextShape content = slide.createTextBox();
        content.setAnchor(new java.awt.Rectangle(50, 150, 600, 300));
        content.addNewTextParagraph().addNewTextRun().setText("Total Aset: " + total);
        content.addNewTextParagraph().addNewTextRun().setText("Kondisi Baik: " + good);
        content.addNewTextParagraph().addNewTextRun().setText("Kondisi Rusak: " + broken);
        content.addNewTextParagraph().addNewTextRun().setText("Dalam Perbaikan: " + inRepair);

        File pptxFile = File.createTempFile("AssetStats_", ".pptx");
        try (FileOutputStream fos = new FileOutputStream(pptxFile)) {
            ppt.write(fos);
        }
        ppt.close();
        return pptxFile;
    }

    public File exportDispositionToWord(Disposition disposition) throws Exception {
        XWPFDocument document = new XWPFDocument();

        // Judul Surat
        XWPFParagraph title = document.createParagraph();
        title.setAlignment(org.apache.poi.xwpf.usermodel.ParagraphAlignment.CENTER);
        XWPFRun titleRun = title.createRun();
        titleRun.setText("SURAT DISPOSISI KEDINASAN");
        titleRun.setBold(true);
        titleRun.setFontSize(16);

        // Pengirim
        XWPFParagraph p1 = document.createParagraph();
        XWPFRun r1 = p1.createRun();
        r1.setText("Dari: " + disposition.getSender().getName() + " (" + disposition.getSender().getRole() + ")");
        r1.addCarriageReturn();

        // Penerima
        XWPFRun r2 = p1.createRun();
        r2.setText("Kepada: " + disposition.getReceiver().getName() + " (" + disposition.getReceiver().getRole() + ")");
        r2.addCarriageReturn();
        r2.addCarriageReturn();

        // Subjek
        XWPFRun r3 = p1.createRun();
        r3.setText("Subjek: " + disposition.getTitle());
        r3.setBold(true);
        r3.addCarriageReturn();
        r3.addCarriageReturn();

        // Deskripsi
        XWPFParagraph p2 = document.createParagraph();
        XWPFRun r4 = p2.createRun();
        r4.setText("Isi Disposisi:");
        r4.addCarriageReturn();
        r4.setText(disposition.getDescription());

        // Lampiran
        if (disposition.getAttachmentUrl() != null && !disposition.getAttachmentUrl().isEmpty()) {
            r4.addCarriageReturn();
            r4.addCarriageReturn();
            r4.setText("Lampiran: " + disposition.getAttachmentUrl());
        }

        File wordFile = File.createTempFile("Disposisi_" + disposition.getId() + "_", ".docx");
        try (FileOutputStream fos = new FileOutputStream(wordFile)) {
            document.write(fos);
        }
        document.close();
        return wordFile;
    }
}
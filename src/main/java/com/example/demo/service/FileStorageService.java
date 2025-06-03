package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    // application.properties에서 실제 저장 경로 주입
    @Value("${file.upload-dir}")
    private String uploadDir;

    public String storeFile(MultipartFile file) {
        // 1. 디렉터리 없으면 생성
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // 2. 파일명 중복 방지 (UUID)
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
        }
        String uniqueFileName = UUID.randomUUID().toString() + extension;

        // 3. 파일 저장 (D:/uploads/파일명)
        Path filePath = Paths.get(uploadDir, uniqueFileName);
        try {
            file.transferTo(filePath.toFile());
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        }

        // 4. DB에는 URL 경로만 저장 (예: /파일명.JPG)
        return "/" + uniqueFileName;
    }
}

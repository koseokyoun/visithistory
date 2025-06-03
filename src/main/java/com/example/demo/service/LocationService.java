package com.example.demo.service;

import com.example.demo.mapper.LocationMapper;
import com.example.demo.model.Location;
import com.example.demo.model.LocationImage;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationService {
    @Autowired
    private FileStorageService fileStorageService;

    private final LocationMapper locationMapper;

    public List<Location> getAllLocations() {
        return locationMapper.findAll();
    }

    @Transactional
    public void saveLocationWithFiles(Location location, List<MultipartFile> imageFiles) {
        // 1. 장소 저장
        locationMapper.insert(location);

        // 2. 이미지 파일 저장
        if (imageFiles != null && !imageFiles.isEmpty()) {
            for (MultipartFile file : imageFiles) {
                // 파일 저장 (예: 서버 디렉터리, S3 등)
                String imageUrl = fileStorageService.storeFile(file);

                // DB에 이미지 URL 저장
                LocationImage image = new LocationImage();
                image.setLocationId(location.getId());
                image.setImageUrl(imageUrl);
                locationMapper.insertImage(image);
            }
        }
    }


    public Location getLocationById(Long id) {
        return locationMapper.findById(id);
    }

    public void updateLocation(Location location) {
        locationMapper.update(location);
    }

    public void deleteLocation(Long id) {
        locationMapper.delete(id);
    }
}

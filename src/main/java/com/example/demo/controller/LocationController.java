package com.example.demo.controller;

import com.example.demo.model.Location;
import com.example.demo.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    // HTML 페이지 렌더링용 - /locations GET
    @GetMapping("/locations")
    public String getLocations(Model model) {
        List<Location> locations = locationService.getAllLocations();
        model.addAttribute("locations", locations);
        return "Location";  // templates/Location.html
    }

    // REST API - 전체 조회
    @ResponseBody
    @GetMapping("/api/locations")
    public List<Location> getAllLocations() {
        return locationService.getAllLocations();
    }

    // REST API - 저장
    @ResponseBody
    @PostMapping(value = "/api/locations", consumes = {"multipart/form-data"})
    public void saveLocationWithFiles(@ModelAttribute Location location,
                                      @RequestParam("imageFiles") List<MultipartFile> imageFiles) {
        locationService.saveLocationWithFiles(location, imageFiles);
    }

    // REST API - 단건 조회
    @ResponseBody
    @GetMapping("/api/locations/{id}")
    public Location getLocationById(@PathVariable Long id) {
        return locationService.getLocationById(id);
    }

    // REST API - 수정
    @ResponseBody
    @PutMapping("/api/locations/{id}")
    public void updateLocation(@PathVariable Long id, @RequestBody Location location) {
        location.setId(id);
        locationService.updateLocation(location);
    }

    // REST API - 삭제
    @ResponseBody
    @DeleteMapping("/api/locations/{id}")
    public void deleteLocation(@PathVariable Long id) {
        locationService.deleteLocation(id);
    }
}

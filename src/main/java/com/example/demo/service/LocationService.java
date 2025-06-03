package com.example.demo.service;

import com.example.demo.mapper.LocationMapper;
import com.example.demo.model.Location;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationMapper locationMapper;

    public List<Location> getAllLocations() {
        return locationMapper.findAll();
    }

    public void saveLocation(Location location) {
        locationMapper.insert(location);
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

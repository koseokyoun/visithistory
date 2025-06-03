package com.example.demo.mapper;

import com.example.demo.model.Location;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface LocationMapper {
    List<Location> findAll();
    Location findById(Long id);
    void insert(Location location);
    void update(Location location);
    void delete(Long id);
}
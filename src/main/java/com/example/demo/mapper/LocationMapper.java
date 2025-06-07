package com.example.demo.mapper;

import com.example.demo.model.Location;
import com.example.demo.model.LocationImage;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface LocationMapper {
    List<Location> findAll();
    Location findById(Long id);
    void insert(Location location); // 장소 저장 (id 자동생성)
    void insertImage(LocationImage image); // 이미지 저장
    void update(Location location);
    void delete(Long id);
    void deleteImage(Long id); // 이미지 delete_flag 업데이트
}
package com.example.demo.model;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
public class Location {
    private Long id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private LocalDate visitedDate;
    private String memo;

    private List<LocationImage> images; // 이미지 리스트 추가

    // Getter/Setter ...
}

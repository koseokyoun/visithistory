package com.example.demo.model;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LocationImage {
    private Long id;
    private Long locationId;
    private String imageUrl;
}

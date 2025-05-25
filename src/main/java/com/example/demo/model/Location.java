package com.example.demo.model;

import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Getter
@Setter
public class Location {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private String imageUrl;
    private LocalDate visitedDate;
    private String memo;

    // 기본 생성자
    public Location() {}

    // 모든 필드 포함 생성자 + Getter/Setter 생략 가능
    // Lombok을 쓰면 @Data 등으로 줄일 수 있음
    // 여기서는 수동으로 추가할게요

    // Getter/Setter ...
    @Override
    public String toString() {
        return "Location{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", address='" + address + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", imageUrl='" + imageUrl + '\'' +
                ", visitedDate=" + visitedDate +
                ", memo='" + memo + '\'' +
                '}';
    }
}

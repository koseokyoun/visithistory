package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class MainController {

    @GetMapping("/location")
    public String mainPage() {
        return "Location"; // templates/main.html 파일을 렌더링
    }
}

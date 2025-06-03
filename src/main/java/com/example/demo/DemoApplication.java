package com.example.demo;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
@MapperScan("com.example.demo.mapper")
public class DemoApplication extends SpringBootServletInitializer {

	private static final Logger logger = LoggerFactory.getLogger(DemoApplication.class);

	public static void main(String[] args) {
		logger.info("🚀 Starting DemoApplication...");
		SpringApplication.run(DemoApplication.class, args);
		logger.info("✅ DemoApplication is running!");
	}
}

package com.zzaptalk.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EntityScan(basePackages = "com.zzaptalk.backend.entity")
@EnableJpaRepositories(basePackages = "com.zzaptalk.backend.repository")
public class ZzaptalkBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ZzaptalkBackendApplication.class, args);
    }

}
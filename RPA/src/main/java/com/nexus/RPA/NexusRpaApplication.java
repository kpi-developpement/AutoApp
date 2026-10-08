package com.nexus.RPA;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class NexusRpaApplication {
    public static void main(String[] args) {
        // Had l'ligne darouri bach Java y9der y-تحكم f l'souris w l'clavier (Robot)
        System.setProperty("java.awt.headless", "false");
        SpringApplication.run(NexusRpaApplication.class, args);
    }
}
package com.example;

public class JavaService {
    public static void main(String[] args) {
        int port = 7000;
        String portEnv = System.getenv("JAVA_SERVICE_PORT");
        if (portEnv != null) {
            try {
                port = Integer.parseInt(portEnv);
            } catch (NumberFormatException e) {
                System.out.println("Invalid port number in JAVA_SERVICE_PORT, using default " + port);
            }
        }
        System.out.println("JavaService running on port " + port);
        // Simulate a running service
        while (true) {
            try {
                Thread.sleep(30000);
                System.out.println("JavaService still running...");
            } catch (InterruptedException e) {
                break;
            }
        }
    }
} 
<?php
require __DIR__ . '/vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Use environment variables for configuration
$port = getenv("PORT") ?: "8000";
$dbHost = getenv("DB_HOST") ?: "127.0.0.1";
$dbPort = getenv("DB_PORT") ?: "3306";
$dbUser = getenv("DB_USER") ?: "phpapp";
$dbPass = getenv("DB_PASS") ?: "secret";

echo "PHP Web App is running.<br>";
echo "Server port: " . $port . "<br>";
echo "DB Connection: " . $dbHost . ":" . $dbPort . " (User: $dbUser)<br>";
?> 
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

function connectRedis() {
    $redisUrl = getenv('REDIS_URL') ?: 'redis://localhost:6379';
    try {
        $redis = new Predis\Client($redisUrl);
        $redis->ping();
        echo "Connected to Redis\n";
    } catch (Exception $e) {
        echo "Redis connection failed: " . $e->getMessage() . "\n";
    }
}

function connectMongo() {
    $mongoUrl = getenv('MONGO_URL') ?: 'mongodb://localhost:27017';
    try {
        $manager = new MongoDB\Driver\Manager($mongoUrl);
        $command = new MongoDB\Driver\Command(['ping' => 1]);
        $cursor = $manager->executeCommand('admin', $command);
        echo "Connected to MongoDB\n";
    } catch (Exception $e) {
        echo "MongoDB connection failed: " . $e->getMessage() . "\n";
    }
}

function connectMySQL() {
    $mysqlUrl = getenv('MYSQL_URL') ?: 'mysql://root:example@localhost:3306/testdb';
    try {
        $pattern = '/mysql:\/\/(.*):(.*)@(.*):(\d+)\/(.*)/';
        if (preg_match($pattern, $mysqlUrl, $matches)) {
            $dsn = "mysql:host={$matches[3]};port={$matches[4]};dbname={$matches[5]}";
            $pdo = new PDO($dsn, $matches[1], $matches[2]);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            echo "Connected to MySQL\n";
        } else {
            echo "Invalid MYSQL_URL format\n";
        }
    } catch (Exception $e) {
        echo "MySQL connection failed: " . $e->getMessage() . "\n";
    }
}

connectRedis();
connectMongo();
connectMySQL();

echo "PHP service is running.\n"; 
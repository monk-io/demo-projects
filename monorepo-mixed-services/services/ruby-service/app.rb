require "sinatra"
require "redis"
require "mongo"
require "mysql2"
require "uri"

configure do
  # Connect to Redis
  redis_url = ENV["REDIS_URL"] || "redis://localhost:6379/0"
  begin
    $redis = Redis.new(url: redis_url)
    $redis.ping
    puts "Connected to Redis"
  rescue => e
    puts "Redis connection error: #{e}"
  end

  # Connect to MongoDB
  mongo_url = ENV["MONGO_URL"] || "mongodb://localhost:27017"
  begin
    mongo_client = Mongo::Client.new(mongo_url, database: "test")
    mongo_client.database_names
    set :mongo_client, mongo_client
    puts "Connected to MongoDB"
  rescue => e
    puts "MongoDB connection error: #{e}"
  end

  # Connect to MySQL
  mysql_url = ENV["MYSQL_URL"] || "mysql2://root:example@localhost:3306/testdb"
  begin
    uri = URI.parse(mysql_url.sub("mysql2://", "mysql://"))
    $mysql_client = Mysql2::Client.new(
      host: uri.host,
      port: uri.port,
      username: uri.user,
      password: uri.password,
      database: uri.path.gsub("/", "")
    )
    puts "Connected to MySQL"
  rescue => e
    puts "MySQL connection error: #{e}"
  end
end

get "/" do
  "Ruby service is running and connected to Redis, MongoDB, and MySQL."
end 
require "sinatra"
require "json"
require "pg"

# Read some configuration from env variables
set :port, (ENV['PORT'] || 4567).to_i
db_host = ENV['DB_HOST'] || "localhost"
db_port = ENV['DB_PORT'] || "3306"
db_user = ENV['DB_USER'] || "sinatrauser"
db_pass = ENV['DB_PASS'] || "secret"
db_name = ENV['DB_NAME'] || "sinatra_db"

begin
  conn = PG.connect(
    host: db_host,
    port: db_port,
    user: db_user,
    password: db_pass,
    dbname: db_name
  )
  puts "Connected to PostgreSQL database successfully."
  conn.close
rescue PG::Error => e
  puts "Database connection failed: #{e.message}"
end

get '/status' do
  content_type :json
  { status: "running", port: settings.port, db: "#{db_host}:#{db_port}" }.to_json
end 
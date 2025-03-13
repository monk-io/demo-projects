(ns clojure-service.core
  (:require [ring.adapter.jetty :refer [run-jetty]]
            [taoensso.carmine :as car]
            [monger.core :as mg]
            [clojure.java.jdbc :as jdbc]
            [clojure.string :as str])
  (:gen-class))

(def redis-conn {:pool {} :spec {:uri (or (System/getenv "REDIS_URL") "redis://localhost:6379")}})

(defn connect-redis []
  (try
    (car/wcar redis-conn (car/ping))
    (println "Connected to Redis")
    (catch Exception e
      (println "Redis connection failed:" (.getMessage e)))))

(defn connect-mongo []
  (try
    (let [conn (mg/connect-via-uri (or (System/getenv "MONGO_URL") "mongodb://localhost:27017"))]
      (println "Connected to MongoDB")
      conn)
    (catch Exception e
      (println "MongoDB connection failed:" (.getMessage e))
      nil)))

(defn connect-mysql []
  (try
    (let [mysql-url (or (System/getenv "MYSQL_URL") "mysql://root:example@localhost:3306/testdb")
          uri (java.net.URI. (str/replace mysql-url "mysql://" "http://"))
          db-spec {:subprotocol "mysql"
                   :subname (str "//" (.getHost uri) ":" (.getPort uri) (.getPath uri))
                   :user (.getUserInfo uri)}]
      (jdbc/query db-spec ["SELECT 1"])
      (println "Connected to MySQL")
      db-spec)
    (catch Exception e
      (println "MySQL connection failed:" (.getMessage e))
      nil)))

(defn handler [request]
  {:status 200
   :headers {"Content-Type" "text/plain"}
   :body "Clojure service is running and connected to Redis, MongoDB, and MySQL."})

(defn -main [& args]
  (connect-redis)
  (connect-mongo)
  (connect-mysql)
  (run-jetty handler {:port 3000 :join? true})) 
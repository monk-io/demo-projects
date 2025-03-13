(ns clojure-service.core
  (:require [ring.adapter.jetty :refer [run-jetty]]
            [clojure.java.jdbc :as jdbc])
  (:gen-class))

(defn handler [request]
  {:status 200
   :headers {"Content-Type" "text/plain"}
   :body (str "Clojure Service running on port " (or (System/getenv "PORT") "3000"))})

(defn -main [& args]
  (let [port (Integer/parseInt (or (System/getenv "PORT") "3000"))
        db-host (or (System/getenv "DB_HOST") "localhost")
        db-port (or (System/getenv "DB_PORT") "5432")]
    (println "Connecting to DB at" db-host ":" db-port)
    (let [db-spec {:dbtype "postgresql"
                   :host db-host
                   :port (Integer/parseInt db-port)
                   :dbname (or (System/getenv "DB_NAME") "clojure_db")
                   :user (or (System/getenv "DB_USER") "clojureuser")
                   :password (or (System/getenv "DB_PASS") "secret")}]
      (try
        (jdbc/query db-spec ["SELECT 1"])
        (println "Database connection successful.")
        (catch Exception e
          (println "Database connection failed:" (.getMessage e)))))
    (run-jetty handler {:port port :join? true}))) 
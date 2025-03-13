(defproject clojure-service "0.1.0-SNAPSHOT"
  :description "A Clojure service connecting to Redis, MongoDB, and MySQL"
  :dependencies [[org.clojure/clojure "1.10.3"]
                 [ring/ring-core "1.9.4"]
                 [ring/ring-jetty-adapter "1.9.4"]
                 [com.taoensso/carmine "2.20.0"]
                 [com.novemberain/monger "3.1.0"]
                 [mysql/mysql-connector-java "8.0.23"]
                 [org.clojure/java.jdbc "0.7.12"]]
  :main clojure-service.core) 
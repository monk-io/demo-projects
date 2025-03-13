FROM clojure:tools-deps-alpine
WORKDIR /app
COPY project.clj /app/
COPY src /app/src
RUN clojure -Sdeps '{:deps {ring/ring-jetty-adapter {:mvn/version "1.9.4"}}}' -T:run -m clojure.main -e "(shutdown-agents)"
EXPOSE 3000
CMD ["clojure", "-M", "-m", "clojure-service.core"] 
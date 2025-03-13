# Monorepo Mixed Services

This monorepo contains several services written in different languages (Go, Node.js, Ruby, PHP, Elixir, and Clojure).  
Each service tries to connect to:

- A single Redis instance,
- A MongoDB instance, and
- A MySQL database.

The project is set up with a root `docker-compose.yml` that builds and runs every service together with the required database services.

To run the project, use:

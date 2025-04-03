package src

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// Server is the main program
func Server() {
	// load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// read configuration from environment variables
	host := os.Getenv("SERVER_HOST") // host to listen to, 0.0.0.0 in prod or localhost
	if host == "" {
		host = "localhost"
	}
	port := os.Getenv("SERVER_PORT") // port to listen to, 8080 is default
	if port == "" {
		port = "8080"
	}
	docker := os.Getenv("DOCKER") == "true" // whether we are running in container
	dbConn := os.Getenv("DB_CONN")          // database connection string postgresql://...

	// prepare service, http handler and server
	gin.SetMode(gin.ReleaseMode)

	router := gin.Default()

	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	router.Use(cors.New(config))
	router.Use(cors.Default())
	service := Service{DBConnString: dbConn}

	// apis
	api := router.Group("/api")
	api.GET("/products", service.ProductService) // api: /api/products
	api.POST("/orders", service.OrderService)    // api: /api/orders

	// serve static files
	router.Use(static.Serve("/", static.LocalFile("./build", true)))
	router.NoRoute(func(c *gin.Context) { // fallback
		c.File("./build/index.html")
	})

	var serverPath string
	if docker {
		serverPath = "0.0.0.0:8080"
		log.Println("Server started at http://localhost:8080 ...")
	} else {
		serverPath = fmt.Sprintf("%s:%s", host, port)
		log.Printf("Server started at http://%s ...\n", serverPath)
	}

	server := &http.Server{
		Addr:         serverPath,
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	// start server
	go func() {
		if err := server.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
			log.Fatalln(err)
		}
	}()

	// graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutdown Server ...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalln(err)
	}
	log.Println("Server exiting")
}

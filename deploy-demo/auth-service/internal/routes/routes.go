package routes

import (
	"auth-service/internal/config"
	"auth-service/internal/database"
	"auth-service/internal/handlers"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(jwtSecret string, cfg *config.Config) *gin.Engine {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.AllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.Use(func(c *gin.Context) {
		c.Set("db", database.GetDB())
		c.Set("jwt-secret", jwtSecret)
		c.Next()
	})

	authGroup := router.Group("/auth")
	{
		authGroup.POST("/signup", handlers.SignUp)
		authGroup.POST("/signin", handlers.SignIn)
		authGroup.GET("/refresh", handlers.JWTMiddleware(jwtSecret), handlers.RefreshToken)
	}
	return router
}

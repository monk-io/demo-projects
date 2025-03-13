package handlers

import (
	"auth-service/internal/models"
	"auth-service/internal/utils"
	"fmt"
	"net/http"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SignUp handles user registration
func SignUp(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Hash the user's password
	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash password"})
		return
	}
	user.Password = hashedPassword

	// Save user to the database
	db := c.MustGet("db").(*gorm.DB)
	if err := user.Create(db); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
}

// SignIn handles user login
func SignIn(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Authenticate user
	db := c.MustGet("db").(*gorm.DB)
	var dbUser models.User
	if err := dbUser.FindByUsername(db, user.Username); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	if !utils.CheckPasswordHash(user.Password, dbUser.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	fmt.Println(c.MustGet("jwt-secret").(string))

	token, err := utils.GenerateToken(c.MustGet("jwt-secret").(string), dbUser.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}

// RefreshToken handles token refresh
func RefreshToken(c *gin.Context) {
	tokenString := c.Request.Header.Get("Authorization")
	if tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No token provided"})
		return
	}

	// chop off the "Bearer " prefix
	tokenString = strings.TrimPrefix(tokenString, "Bearer ")

	claims := &utils.Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(c.MustGet("jwt-secret").(string)), nil
	})

	if err != nil || !token.Valid {
		fmt.Println("Error parsing token", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	newToken, err := utils.GenerateToken(c.MustGet("jwt-secret").(string), claims.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate new token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": newToken})
}

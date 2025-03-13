package models

import (
	"gorm.io/gorm"
)

type User struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Username string `gorm:"uniqueIndex" json:"username"`
	Fullname string `json:"fullname"`
	Password string `json:"password"`
	Email    string `gorm:"uniqueIndex" json:"email"`
}

func (u *User) Create(db *gorm.DB) error {
	return db.Create(u).Error
}

func (u *User) FindByUsername(db *gorm.DB, username string) error {
	return db.Where("username = ?", username).First(u).Error
}

func (u *User) FindByEmail(db *gorm.DB, email string) error {
	return db.Where("email = ?", email).First(u).Error
}

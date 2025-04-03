package src

import (
	"database/sql"
	"errors"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"

	// blank import for side effect
	_ "github.com/lib/pq"
)

const dbFileSchema = "./db/scheme.sql"

// Service is the backend DB/REST api struct
type Service struct {
	DBConnString string
}

func (s *Service) getDatabase() (*sql.DB, error) {
	db, err := sql.Open("postgres", s.DBConnString)
	if err != nil {
		return nil, err
	}

	c, err := os.ReadFile(dbFileSchema)
	if err != nil {
		return nil, err
	}
	sqlQuery := string(c)

	// execute db schema file
	if _, err = db.Exec(sqlQuery); err != nil {
		db.Close()
		return nil, err
	}

	return db, nil
}

// LoadProductsFromDatabase load product list from DB
func (s *Service) LoadProductsFromDatabase() (products []Product, err error) {

	db, err := s.getDatabase()
	if err != nil {
		log.Println(err)
		return
	}
	defer db.Close()

	if err = db.Ping(); err != nil {
		log.Println(err)
		return
	}

	rows, err := db.Query("SELECT * FROM products")
	if err != nil {
		log.Println(err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		p := Product{}
		if err := rows.Scan(&p.Id, &p.Name, &p.Category, &p.Description, &p.Price); err != nil {
			log.Println(err)
			continue
		}
		products = append(products, p)
	}

	log.Printf("Queried %d product(s)", len(products))
	return
}

// StoreOrderIntoDatabase insert new order into DB
func (s *Service) StoreOrderIntoDatabase(newOrder Order) (newID int, err error) {

	db, err := s.getDatabase()
	if err != nil {
		log.Println(err)
		return
	}
	defer db.Close()

	if err = db.Ping(); err != nil {
		log.Println(err)
		return
	}

	rowStmt, err := db.Prepare("SELECT MAX(id) AS id FROM orders")
	if err != nil {
		log.Println("prepare select max(id)", err)
		return
	}
	defer rowStmt.Close()

	// get the last order id

	var id sql.NullInt32
	if err = rowStmt.QueryRow().Scan(&id); err != nil {
		log.Println("exec select max(id)", err)
		return
	}
	if id.Valid {
		newID = int(id.Int32) + 1
	} else {
		newID = 1
	}

	// write each order line as a row

	insertStmt, err := db.Prepare("INSERT INTO orders (id, product_id, quantity) values ($1, $2, $3)")
	if err != nil {
		log.Println("prepare insert order", err)
		return
	}
	defer insertStmt.Close()

	var itemCount int
	for _, line := range newOrder.Lines {
		itemCount += line.Quantity
		if _, err = insertStmt.Exec(newID, line.ProductId, line.Quantity); err != nil {
			log.Println("exec insert order", err, newID, line.ProductId, line.Quantity)
		}
	}

	log.Printf("Order #%d (%d items) added\n", newID, itemCount)
	return
}

// ProductService is the GET service for product list
func (s *Service) ProductService(c *gin.Context) {

	products, err := s.LoadProductsFromDatabase()
	if err != nil {
		log.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// return JSON
	c.JSON(http.StatusOK, products)
}

// OrderService is the POST service to add new oerder
func (s *Service) OrderService(c *gin.Context) {

	newOrder := Order{}
	if err := c.BindJSON(&newOrder); err != nil {
		log.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	newId, err := s.StoreOrderIntoDatabase(newOrder)
	if err != nil || newId == 0 {
		if newId == 0 {
			err = errors.New("unable to get new order id")
		}
		log.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// return the new order id
	result := Result{Id: newId}
	c.JSON(http.StatusCreated, result)
}

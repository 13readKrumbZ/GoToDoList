package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type todo struct {
	ID      string `json:"id"`
	Content string `json:"content"`
}

var todos = []todo{}

// Load todos from JSON file
func loadTodos() error {
	file, err := os.Open("todos.json")
	if err != nil {
		// If the file doesn't exist, return empty slice
		if os.IsNotExist(err) {
			todos = []todo{}
			return nil
		}
		return err
	}
	defer file.Close()

	bytes, err := io.ReadAll(file)
	if err != nil {
		return err
	}

	return json.Unmarshal(bytes, &todos)

}

// save file to JSON file
func saveTodos() error {
	bytes, err := json.MarshalIndent(todos, "", "  ")
	if err != nil {
		return err
	}
	log.Printf("New todo saved")
	return os.WriteFile("todos.json", bytes, 0644)
}

func deleteTodo(c *gin.Context) {
	id := c.Param("id")

	// Find the index of the todo with the given ID
	index := -1
	for i, t := range todos {
		if t.ID == id {
			index = i
			break
		}
	}

	// if index remains -1, it means the todo was not found
	// Return a 404 Not Found error
	if index == -1 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Todo not found"})
		return
	}

	// Remove the todo from the slice
	todos = append(todos[:index], todos[index+1:]...)

	if err := saveTodos(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save todos"})
		return
	}

	log.Printf("Todo with ID %s deleted", id)
	c.Status(http.StatusNoContent)
}

func getTodos(c *gin.Context) {

	if err := loadTodos(); err != nil {
		log.Printf("Failed to load todos: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load todos"})
		return
	}

	if len(todos) == 0 {
		c.IndentedJSON(http.StatusOK, []todo{})
		return
	}

	c.IndentedJSON(http.StatusOK, todos)

}

// Create a new todo and add it to todos[]
func createTodo(c *gin.Context) {
	var newTodo todo
	if err := c.BindJSON(&newTodo); err != nil {
		return
	}

	// Check if the fields are populated
	if newTodo.ID == "" || newTodo.Content == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing fields in todo"})
		return
	}

	todos = append(todos, newTodo)

	if err := saveTodos(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save todos"})
		return
	}

	log.Printf("New todo added: %+v", newTodo)
	c.IndentedJSON(http.StatusCreated, newTodo)
}

func main() {

	// Load existing todos from file at startup
	if err := loadTodos(); err != nil {
		panic("Failed to load todos:" + err.Error())
	}

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"PUT", "PATCH", "POST", "DELETE", "GET"},
		AllowHeaders:     []string{"Content-Type"},
		AllowCredentials: true,
	}))
	router.GET("/todos", getTodos)
	router.POST("/todos", createTodo)
	router.DELETE("/todos/:id", deleteTodo)

	router.Run("localhost:8080")
}

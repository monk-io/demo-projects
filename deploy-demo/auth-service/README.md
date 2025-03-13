# Auth Service

This is the Auth service, responsible for handling user authentication, including sign-ups, sign-ins, and token refresh. It issues JWTs for secure communication with the backend API.

## Project Structure

```
auth-service
├── cmd
│   └── main.go            # Entry point of the application
├── internal
│   ├── config
│   │   └── config.go      # Configuration settings
│   ├── database
│   │   └── database.go     # Database connection management
│   ├── handlers
│   │   ├── auth.go        # HTTP handlers for authentication
│   │   └── middleware.go   # Middleware functions
│   ├── models
│   │   └── user.go        # User model definition
│   ├── routes
│   │   └── routes.go      # Application routes
│   └── utils
│       └── jwt.go        # JWT utility functions
├── go.mod                 # Go module definition
├── go.sum                 # Module dependency checksums
└── README.md              # Project documentation
```

## Setup Instructions

1. Clone the repository:

   ```
   git clone <repository-url>
   cd auth-service
   ```

2. Install dependencies:

   ```
   go mod tidy
   ```

3. Configure environment variables as needed.

4. Run the application:
   ```
   go run cmd/main.go
   ```

## Usage

- **Sign Up**: POST `/auth/signup` - Create a new user account.
- **Sign In**: POST `/auth/signin` - Authenticate a user and receive a JWT.
- **Token Refresh**: POST `/auth/refresh` - Refresh the JWT token.

## License

This project is licensed under the MIT License.

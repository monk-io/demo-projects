# my-backend-project/my-backend-project/README.md

# My Backend Project

This project is a REST API built with FastAPI that implements CRUD operations for User, Post, Comment, and Friendship structures. It uses PostgreSQL for data storage.

## Project Structure

```
my-backend-project
├── app
│   ├── __init__.py
│   ├── main.py
│   ├── models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── post.py
│   │   ├── comment.py
│   │   └── friendship.py
│   ├── routers
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── post.py
│   │   ├── comment.py
│   │   └── friendship.py
│   ├── schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── post.py
│   │   ├── comment.py
│   │   └── friendship.py
│   └── database.py
├── alembic
│   ├── versions
│   │   └── .gitkeep
│   ├── env.py
│   ├── script.py.mako
│   └── alembic.ini
├── .env
├── .gitignore
├── requirements.txt
└── README.md
```

## Features

- User management (CRUD operations)
- Post management (CRUD operations)
- Comment management (CRUD operations)
- Friendship management (CRUD operations)

## Requirements

- Python 3.8+
- PostgreSQL
- FastAPI
- SQLAlchemy
- Alembic

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd my-backend-project
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

4. Set up your database connection in the `.env` file.

## Running the Application

To run the application, execute the following command:

```
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

## Database Migrations

To manage database migrations, use Alembic. Run the following command to create a new migration:

```
alembic revision --autogenerate -m "Migration message"
```

Then apply the migration with:

```
alembic upgrade head
```

## License

This project is licensed under the MIT License.
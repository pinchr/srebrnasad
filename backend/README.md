# Srebrna 15 Backend

Python FastAPI backend for the Srebrna 15 orchard website.

## Tech Stack

- **FastAPI** - Modern web framework
- **MongoDB** - Database
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

## Features (Phase 1)

- Contact form API endpoint
- Health check endpoint
- CORS support for frontend communication

## Setup

### Prerequisites

- Python 3.10+
- MongoDB 5.0+
- pip or poetry

### Installation

1. Create virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create `.env` file from example:

```bash
cp .env.example .env
```

4. Configure MongoDB connection in `.env`

### Development

Run the development server:

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

API documentation (auto-generated):
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── main.py              - FastAPI app and main routes
├── database.py          - MongoDB connection and initialization
├── routers/
│   ├── __init__.py
│   └── contact.py       - Contact form endpoints
├── requirements.txt     - Python dependencies
├── .env.example         - Environment variables template
└── README.md
```

## API Endpoints

### Health Check

- **GET** `/health` - Health check
- **GET** `/` - API info

### Contact Form (Phase 1)

- **POST** `/contact/` - Submit contact message
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+48...",
    "message": "..."
  }
  ```

### Admin Endpoints (Phase 2)

- **GET** `/contact/messages` - Get all messages
- **GET** `/contact/messages/{message_id}` - Get specific message

## MongoDB Setup

### Local Development

Install MongoDB Community Edition and run:

```bash
mongod
```

### MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URL` in `.env`

```
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
```

## Environment Variables

See `.env.example` for available options:

- `MONGODB_URL` - MongoDB connection string
- `DATABASE_NAME` - Database name
- `API_HOST` - Server host (default: 0.0.0.0)
- `API_PORT` - Server port (default: 8000)
- `DEBUG` - Debug mode (default: True)

## Next Steps (Phase 2)

- Apple inventory management
- Admin authentication
- Image upload endpoints
- Order system endpoints
- Calendar and time slot management
- Email notifications

## Deployment

### Heroku

```bash
heroku create app-name
heroku config:set MONGODB_URL=...
git push heroku main
```

### Docker

Create `Dockerfile` and `docker-compose.yml` for containerization.

### Railway, Render, or other platforms

See respective documentation for FastAPI deployment.

## Testing

```bash
pip install pytest pytest-asyncio
pytest
```

## Troubleshooting

**MongoDB Connection Error**

- Ensure MongoDB is running
- Check `MONGODB_URL` in `.env`
- Verify database name in `DATABASE_NAME`

**CORS Issues**

- Check allowed origins in `main.py`
- Ensure frontend URL is in the allowed list

**Port Already in Use**

```bash
# Change port in code or use environment variable
uvicorn main:app --port 8001
```

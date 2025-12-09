# Self-Contained Development Setup

This repository has been configured to run completely self-contained, without depending on external Gramps resources (like the backend Docker image).

## Prerequisites

- Node.js and npm
- Docker and Docker Compose (optional, for containerized run)

## Running Locally (No Docker)

You can run the frontend and a mock API server locally.

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Start the mock API server:
    ```bash
    npm run start:mock-api
    ```
    This runs the mock server on `http://localhost:5555`.

3.  Start the frontend:
    ```bash
    npm start
    ```
    This runs the frontend on `http://localhost:8001`.

The frontend is configured to talk to `http://localhost:5555` by default.

## Running with Docker Compose

You can run the entire stack (frontend + mock backend + proxy) using Docker Compose.

```bash
docker-compose -f docker-compose.self-contained.yml up --build
```

This will expose:
- Frontend via Proxy: `http://localhost:5555`
- Frontend Direct: `http://localhost:8001`

## Mock Server

The mock server is located in `mock-server/`. It mimics the essential Gramps Web API endpoints required for the frontend to function.
You can extend `mock-server/server.js` to add more mock data or endpoints as needed.

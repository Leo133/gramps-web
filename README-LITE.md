# Gramps Web Lite

This is a fully self-contained version of Gramps Web, running with a lightweight Node.js backend instead of the full Python Gramps backend.

## Features

- **Self-Contained**: No external dependencies, no Python, no heavy Docker images.
- **Persistence**: Data is stored in `db.json` in the `mock-server` directory.
- **Chat**: Includes a smart chat agent that can answer questions about your family tree data.
- **Search**: Fuzzy search for people.
- **People Management**: View list of people and their details.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start the Backend**:
    ```bash
    npm run start:mock-api
    ```
    This starts the Lite server on port 5555.

3.  **Start the Frontend**:
    ```bash
    npm start
    ```
    This starts the frontend on port 8001.

4.  **Login**:
    - Username: `owner`
    - Password: `owner`

## Chat Features

Go to the **Chat** page and try asking:
- "Who is John Doe?"
- "When was Jane Smith born?"
- "How many people are in the tree?"

The chat agent uses fuzzy matching to find people in your database and constructs answers based on their profile data.

## Data Management

The initial database is populated with sample data. You can edit `mock-server/db.json` to add your own family tree data manually, or we can expand the API to support importing GEDCOM files in the future.

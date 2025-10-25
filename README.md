# 🛒 PantryPal - Grocery Inventory Management

PantryPal is a simple web application to track your home grocery inventory. Built with a Python (FastAPI) backend and a vanilla JavaScript frontend.

![PantryPal Screenshot](https://i.imgur.com/your-screenshot.png) 
*(Replace with an actual screenshot of your app)*

## Features

* **View Inventory:** See all your items at a glance.
* **Add/Edit/Delete Items:** Full CRUD functionality for your groceries.
* **Track Details:** Store quantity, unit, purchase/expiry dates, and category.
* **Low Stock & Expiry Alerts:** Items nearing expiry or below the threshold are highlighted.
* **Search:** Quickly find items by name or category.
* **User Authentication:** Secure login and registration using JWT.

## Tech Stack

* **Backend:** Python 3.9+, FastAPI, SQLAlchemy (with SQLite), Pydantic, Passlib (for hashing), python-jose (for JWT).
* **Frontend:** Vanilla JavaScript, HTML5, CSS3.
* **Database:** SQLite.

## Project Structure
pantrypal-app/ 
├── backend/ # FastAPI application 
├── frontend/ # HTML, CSS, JavaScript files 
├── .gitignore 
├── README.md 
└── requirements.txt # Backend Python dependencies

## Getting Started

### Prerequisites

* Python 3.9 or higher
* Node.js and npm (only if you plan to add frontend build tools later, not needed for basic setup)
* Git

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/pantrypal-app.git](https://github.com/your-username/pantrypal-app.git)
    cd pantrypal-app
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    # Create and activate a virtual environment
    python3 -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`

    # Install backend dependencies
    pip install -r ../requirements.txt # Note: requirements.txt is in root

    # Create a .env file
    cp .env.example .env # If you create an example file
    # OR create .env manually and add your SECRET_KEY etc.
    # Make sure DATABASE_URL points to where you want the db file, e.g. sqlite:///./pantrypal.db
    ```
    *Edit the `.env` file and set a strong `SECRET_KEY`.*

3.  **Frontend Setup:**
    * No build steps needed for vanilla JS. Just open the `frontend/index.html` file in your browser *after* starting the backend.

### Running the Application

1.  **Start the Backend Server:**
    * Make sure your backend virtual environment is activated.
    * Navigate to the `backend` directory.
    * Run Uvicorn:
        ```bash
        uvicorn main:app --reload --port 8000
        ```
    * The API will be running at `http://127.0.0.1:8000`. The interactive docs are at `http://127.0.0.1:8000/docs`.
    * The first time you run it, the `pantrypal.db` SQLite file will be created.

2.  **Open the Frontend:**
    * Open the `frontend/index.html` file directly in your web browser (e.g., double-click it or use `File > Open`).

## How It Works

* The **Frontend** (HTML, CSS, JS) runs in your browser. It makes API calls to the backend using `fetch`.
* The **Backend** (FastAPI) listens for requests, interacts with the SQLite **Database** using SQLAlchemy, handles authentication, and sends back JSON data.
* User authentication uses **JWT** (JSON Web Tokens). The token is stored in the browser's `localStorage`.

## Future Enhancements

* **Barcode Scanning:** Use a JS library (like QuaggaJS) to scan barcodes and autofill item names.
* **Recipe Suggestions:** Integrate with a recipe API based on available ingredients.
* **Shopping List Generation:** Automatically create a shopping list based on low-stock items.
* **Deployment:** Deploy the backend to a service like Render or Fly.io and the frontend to Netlify or Vercel.
* **More Robust Frontend:** Use a framework like React, Vue, or Svelte for better state management and component structure.

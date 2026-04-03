# 🎬 Movie API - FastAPI Project

This project is a full-stack application built with **FastAPI**, **SQLite**, and a simple **JavaScript frontend** that allows users to search for movies and manage their list of favorite films.

It integrates with the **TMDB (The Movie Database) API** to fetch real movie data and provides full CRUD functionality for storing favorites locally.

---

## 🚀 Features

* 🔍 Search movies using TMDB API
* ⭐ Save movies as favorites
* ✏️ Update movie ratings (1–5)
* 🗑️ Delete favorites
* 🎨 Interactive UI with hover effects and animations

---

## 🛠️ Tech Stack

### Backend

* Python
* FastAPI
* SQLAlchemy
* SQLite
* HTTPX

### Frontend

* HTML
* CSS (custom styling, card-based UI)
* Vanilla JavaScript

---

## 📦 Project Structure

```
MovieAPI/
│
├── main.py
├── database/
│   ├── database.py
│   └── models.py
│
├── routes/
│   └── movies.py
│
├── schemas/
│   └── movie.py
│
├── services/
│   └── fetch_movies.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
└── requirements.txt
```

---

## ⚙️ Setup (Local)

1. Clone the repository:

```
git clone https://github.com/Yizuzzz/MovieAPI.git
cd MovieAPI
```

2. Create virtual environment:

```
python -m venv venv
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

3. Install dependencies:

```
pip install -r requirements.txt
```

4. Create a `.env` file:

```
TMDB_APIKEY=your_tmdb_api_key_v3
```

5. Run the server:

```
uvicorn main:app --reload
```

---

## 🌐 Deployment

* Backend deployed on Render
* Frontend can be served locally or deployed on Vercel

---

## 🔑 Important Note

This project uses the **TMDB API v3 key**, which must be passed as a query parameter:

```
api_key=YOUR_API_KEY
```

Bearer tokens (v4) are **not used** in this implementation.

---

## 📌 Endpoints Overview

| Method | Endpoint               | Description       |
| ------ | ---------------------- | ----------------- |
| GET    | /movies/search?q=      | Search movies     |
| POST   | /movies/favorites      | Add favorite      |
| GET    | /movies/favorites      | Get all favorites |
| PATCH  | /movies/favorites/{id} | Update rating     |
| DELETE | /movies/favorites/{id} | Delete favorite   |

---

## 🎯 Future Improvements

* User authentication
* Cloud database (PostgreSQL)
* Better UI/UX (React or Svelte)
* Image caching
* Rate limiting & logging

---

## 👨‍💻 Author

Jesús Alvarez

---

## ⭐ Acknowledgements

* TMDB API
* FastAPI Documentation

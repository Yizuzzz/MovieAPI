# 🎬 Movie API - Full Stack App (FastAPI + SPA)

A modern full-stack movie application built with **FastAPI**, **PostgreSQL (Supabase)**, and a **Vanilla JavaScript SPA frontend**.

Users can search movies from TMDB, create accounts, authenticate using JWT, and manage both **Favorites** and **Watchlist** with ratings and reviews.

---

## ✨ Features

### 🔍 Movie Search

* Search real movies via TMDB API
* Dynamic results with instant search (debounce)
* Poster, overview, and release date

### 🔐 Authentication (JWT)

* User registration & login
* Secure password hashing (bcrypt)
* JWT-based authentication
* Protected routes (favorites & watchlist)

### ⭐ Favorites System

* Add movies to favorites
* Rate movies (1–5)
* Add personal reviews
* Update rating & review (modal UI)
* Delete favorites

### 📌 Watchlist

* Save movies to watch later
* Prevent duplicates
* Remove from watchlist

### 🎨 Frontend (SPA)

* Single Page Application (no reloads)
* Dynamic view switching (search / favorites / watchlist)
* Modal-based editing (no prompt)
* Toast notifications
* Netflix-style UI (cards + hover effects)

---

## 🛠️ Tech Stack

### Backend

* Python
* FastAPI
* SQLAlchemy
* Alembic (migrations)
* PostgreSQL (Supabase)
* JWT Authentication
* Passlib (bcrypt)
* HTTPX (TMDB requests)

### Frontend

* HTML
* CSS (custom, Netflix-style UI)
* Vanilla JavaScript (SPA logic)

---

## 📦 Project Structure

```
MovieAPI/
│
├── main.py
│
├── database/
│   ├── database.py
│   ├── user.py
│   ├── movie.py
│   ├── favorite.py
│   └── watchlist.py
│
├── routes/
│   ├── auth.py
│   └── movies.py
│
├── schemas/
│   ├── user.py
│   ├── movie.py
│
├── services/
│   └── fetch_movies.py
│   └── JWT.py
│   └── security.py
│
├── alembic/
│   └── versions/
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── alembic.ini
├── requirements.txt
```

---

## ⚙️ Setup (Local)

### 1. Clone repo

```
git clone https://github.com/Yizuzzz/MovieAPI.git
cd MovieAPI
```

### 2. Virtual environment

```
python -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```
pip install -r requirements.txt
```

### 4. Environment variables

Create `.env`:

```
DATABASE_URL=your_supabase_postgres_url
TMDB_APIKEY=your_tmdb_api_key
SECRET_KEY=your_jwt_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

---

### 5. Run migrations

```
alembic revision --autogenerate -m "init"
alembic upgrade head
```

---

### 6. Run server

```
uvicorn main:app --reload
```

---

## 🌐 Deployment

* Backend → Render
* Database → Supabase (PostgreSQL)
* Frontend → Vercel

---

## 🔑 Authentication Flow

1. User logs in via `/auth/login`
2. Receives JWT token
3. Token stored in frontend (localStorage)
4. Sent in headers:

```
Authorization: Bearer <token>
```

---

## 📡 API Endpoints

### 🔐 Auth

| Method | Endpoint       | Description |
| ------ | -------------- | ----------- |
| POST   | /auth/register | Create user |
| POST   | /auth/login    | Login + JWT |

---

### 🎬 Movies

| Method | Endpoint          | Description |
| ------ | ----------------- | ----------- |
| GET    | /movies/search?q= | Search TMDB |

---

### ⭐ Favorites (Protected)

| Method | Endpoint               | Description            |
| ------ | ---------------------- | ---------------------- |
| GET    | /movies/favorites      | Get user favorites     |
| POST   | /movies/favorites      | Add favorite           |
| PATCH  | /movies/favorites/{id} | Update rating & review |
| DELETE | /movies/favorites/{id} | Delete favorite        |

---

### 📌 Watchlist (Protected)

| Method | Endpoint               | Description   |
| ------ | ---------------------- | ------------- |
| GET    | /movies/watchlist      | Get watchlist |
| POST   | /movies/watchlist      | Add movie     |
| DELETE | /movies/watchlist/{id} | Remove movie  |

---

## 🎨 Frontend Highlights

* SPA navigation (no reload)
* Debounced search
* Modal editing (rating + review)
* Toast notifications
* Responsive grid layout
* Auth-aware UI (login/logout states)

---

## ⚠️ Known Challenges Solved

* CORS issues (Render ↔ Vercel)
* JWT integration with Swagger
* Handling 401/422 errors
* Preventing duplicate favorites/watchlist
* Syncing frontend state with backend

---

## 🚀 Future Improvements

* Refresh tokens
* User profiles
* Pagination / infinite scroll
* Image lazy loading
* Full framework frontend (React / Svelte)
* Recommendations system (ML/AI 👀)

---

## 👨‍💻 Author

Jesús Alvarez

---

## ⭐ Acknowledgements

* TMDB API
* FastAPI docs
* Supabase
* Render / Vercel

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.movies import router as movies_router
from routes import auth

app = FastAPI()
origins = ["http://localhost:3000",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
            "http://127.0.0.1:5500",
            "http://localhost:5500"
            "https://movie-api-yfyi.vercel.app",
            "https://movie-api-yfyi.vercel.app",
            "https://movie-api-yfyi.vercel.app/",
            "http://127.0.0.1:5500/frontend/index.html",
           ]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(movies_router)
app.include_router(auth.router)

@app.get("/")
async def root():
    return {"message": "Hello World"}


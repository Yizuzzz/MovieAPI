from fastapi import FastAPI
from routes.movies import router as movies_router

app = FastAPI()
app.include_router(movies_router)

@app.get("/")
async def root():
    return {"message": "Hello World"}


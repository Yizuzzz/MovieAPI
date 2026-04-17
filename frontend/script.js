const ruta = "https://movieapi-mwc0.onrender.com/movies/";

let token = localStorage.getItem("token") || null;

function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

let currentPage = 1;
const pageSize = 10;
let allFavorites = [];

function clearSections() {
    document.getElementById("results").innerHTML = "";
    document.getElementById("favorites").innerHTML = "";
    document.getElementById("watchlist").innerHTML = "";
}

function showLogin() {
    const container = document.getElementById("auth-container");

    container.classList.remove("hidden");

    document.getElementById("login-form").classList.remove("hidden");
    document.getElementById("register-form").classList.add("hidden");
    document.addEventListener("click", (e) => {
    const container = document.getElementById("auth-container");

    if (!container.contains(e.target) && !e.target.closest(".btn-auth")) {
        container.classList.add("hidden");
    }
});
}

function showRegister() {
    const container = document.getElementById("auth-container");

    container.classList.remove("hidden");

    document.getElementById("register-form").classList.remove("hidden");
    document.getElementById("login-form").classList.add("hidden");
    document.addEventListener("click", (e) => {
    const container = document.getElementById("auth-container");

    if (!container.contains(e.target) && !e.target.closest(".btn-auth")) {
        container.classList.add("hidden");
    }
});
}

function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    fetch("https://movieapi-mwc0.onrender.com/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        token = data.access_token;
        localStorage.setItem("token", token);
        updateAuthUI();
        document.getElementById("login-email").value = "";
        document.getElementById("login-password").value = "";
        document.getElementById("auth-container").classList.add("hidden");
        showToast("Login exitoso 🔐");
    })
    .catch(() => showToast("Error en login"));
    clearSections();
}

function register() {
    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    fetch("https://movieapi-mwc0.onrender.com/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password })
    })
    .then(res => res.json())
    .then(() => {
        showToast("Usuario creado 🎉");
        document.getElementById("register-username").value = "";
        document.getElementById("register-email").value = "";
        document.getElementById("register-password").value = "";
        document.getElementById("auth-container").classList.add("hidden");
        showLogin();
    })
    .catch(() => showToast("Error en registro"));
    clearSections();
}

function logout() {
    token = null;
    localStorage.removeItem("token");
    updateAuthUI();
    clearSections();
    showToast("Sesión cerrada");
}

function updateAuthUI() {
    const loginBtn = document.getElementById("login-btn");
    const registerBtn = document.getElementById("register-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const secondaryBtns = document.querySelectorAll(".btn-secondary");

    if (token) {
        loginBtn.classList.add("hidden");
        registerBtn.classList.add("hidden");
        logoutBtn.classList.remove("hidden");
        secondaryBtns.forEach(btn => btn.classList.remove("hidden"));
    } else {
        loginBtn.classList.remove("hidden");
        registerBtn.classList.remove("hidden");
        logoutBtn.classList.add("hidden");
        secondaryBtns.forEach(btn => btn.classList.add("hidden"));
    }
}

updateAuthUI();

function searchMovies() {
    document.getElementById("favorites").innerHTML = "";
    clearSections();

    const query = document.getElementById("movie-name").value;

    fetch(`${ruta}search?q=` + query)
        .then(response => response.json())
        .then(data => {
            const resultsDiv = document.getElementById("results");
            resultsDiv.innerHTML = "";

                if (!Array.isArray(data)) {
                    console.error("Respuesta inesperada:", data);
                    return;
                }

                data.forEach(movie => {
                const movieDiv = document.createElement("div");
                movieDiv.classList.add("movie-result");

                // 🔥 Card estilo Netflix
                movieDiv.innerHTML = `
                    <div class="card">
                        <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
                        
                        <div class="overlay">
                            <h3>${movie.title}</h3>
                            <p>${movie.overview}</p>
                            <p>📅 ${movie.release_date}</p>
                            <button class="save-btn">⭐ Guardar</button>
                            <button class="watch-btn">📌 Watchlist</button>
                        </div>
                    </div>
                `;

                // 🔥 Evento del botón dentro del overlay
                const saveBtn = movieDiv.querySelector(".save-btn");

                saveBtn.addEventListener("click", () => {
                    saveBtn.disabled = true;
                    const card = saveBtn.closest(".card");

                    saveFavorite(movie).then(success => {
                        if (success) {
                            saveBtn.textContent = "✔ Guardado";

                            card.classList.add("pop");
                            setTimeout(() => card.classList.remove("pop"), 300);

                            showToast("Película agregada a favoritos ⭐");
                        } else {
                            saveBtn.disabled = false;
                        }
                    });
                }, { once: true });

                const watchBtn = movieDiv.querySelector(".watch-btn");

                watchBtn.addEventListener("click", () => {
                    addToWatchlist(movie);
                    showToast("Película agregada a watchlist 📌")
                ;});

                resultsDiv.appendChild(movieDiv);
            });
        })
        .catch(error => console.error("Error fetching movies:", error));
}

let isSaving = false;

function saveFavorite(movie) {
    if(!token) {
        showToast("⚠️ Debes iniciar sesión para guardar favoritos");
        return Promise.resolve(false);
    }

    const ratingInput = prompt("Califica la película (1-5):");
    if (ratingInput === null) return Promise.resolve(false);

    const rating = parseInt(ratingInput);
    if (isNaN(rating) || rating < 1 || rating > 5) {
        alert("Número inválido");
        return Promise.resolve(false);
    }

    const reviewInput = prompt("Escribe una reseña (opcional):");

    return fetch(`${ruta}favorites`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            tmdb_id: movie.id,
            title: movie.title,
            overview: movie.overview,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            rating: rating,
            review: reviewInput ? reviewInput.trim() : null
        })
    })
    .then(res => {
        if (!res.ok) {
            showToast("⚠️ Ya está en favoritos o no autorizado");
            return false;
        }
        return true;
    });
}

function checkIfExistsAndSave(movie, rating) {
    fetch(`${ruta}favorites`)
        .then(res => res.json())
        .then(favorites => {

            const exists = favorites.some(fav => 
                fav.title.toLowerCase() === movie.title.toLowerCase()
            );

            if (exists) {
                alert("⚠️ Esta película ya está en favoritos");
                return;
            }

            // 👇 si no existe, guardar
            fetch(`${ruta}favorites`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: movie.title,
                    overview: movie.overview,
                    release_date: movie.release_date,
                    poster_path: movie.poster_path,
                    rating: rating
                })
            })
            .then(res => res.json())
            .then(() => {
                alert("Película guardada ⭐");
            });

        });
}

function getFavorites() {
    document.getElementById("results").innerHTML = "";
    clearSections();

    fetch(`${ruta}favorites`, {
        headers: getAuthHeaders()
    })
        .then(response => response.json())
        .then(data => {
            const favoritesDiv = document.getElementById("favorites");
            favoritesDiv.innerHTML = "";

            data.forEach(movie => {
                const movieDiv = document.createElement("div");
                movieDiv.classList.add("favorite-movie");

                movieDiv.innerHTML = `
                    <div class="card">
                        <img src="https://image.tmdb.org/t/p/w300${movie.movie.poster_path}" alt="${movie.movie.title}">
                        
                        <div class="overlay">
                            <h3>${movie.movie.title}</h3>
                            <p>⭐ Rating: ${movie.rating}</p>
                            <p>📝 ${movie.review ?? "Sin reseña"}</p>
                            <button class="update-btn">✏️ Editar</button>
                            <button class="delete-btn">🗑 Eliminar</button>
                        </div>
                    </div>
                `;

                movieDiv.querySelector(".update-btn")
                    .addEventListener("click", () => newRatingValue(movie.movie.id));

                movieDiv.querySelector(".delete-btn")
                    .addEventListener("click", () => deleteFavorite(movie.movie.id));

                favoritesDiv.appendChild(movieDiv);
            });
        })
        .catch(error => console.error("Error fetching favorites:", error));
}

function newRatingValue(movieId) {
    const newRating = prompt("Ingrese el nuevo rating (1-5):");
    if (newRating !== null) {
        const ratingValue = parseInt(newRating);
        if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
            alert("Por favor, ingrese un número válido entre 1 y 5.");
            return;
        }
        updateButton(movieId, ratingValue);
    }
}

function updateButton(movieId, newRating) {
    fetch(`${ruta}favorites/${movieId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            rating: newRating
        })
    })
    .then(response => response.json())
    .then(data => {
        alert(`Película ${data.title} actualizada ⭐`);
        getFavorites(); // Refresh the favorites list
    })
}

function deleteFavorite(movieId) {
    if (confirm("¿Estás seguro de que quieres eliminar esta película de tus favoritos?")) {
        fetch(`${ruta}favorites/${movieId}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            getFavorites(); // Refresh the favorites list
        })
        .catch(error => {
            console.error("Error deleting favorite:", error);
            alert("Error al eliminar la película. Inténtalo de nuevo.");
        });
    }
}

function getWatchlist() {
    document.getElementById("results").innerHTML = "";
    document.getElementById("favorites").innerHTML = "";
    clearSections();

    fetch(`${ruta}watchlist`, {
        headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("watchlist");
        container.innerHTML = "";

        data.forEach(item => {
            const div = document.createElement("div");
            div.classList.add("movie-result");

            div.innerHTML = `
                <div class="card">
                    <img src="https://image.tmdb.org/t/p/w300${item.movie.poster_path}">
                    <div class="overlay">
                        <h3>${item.movie.title}</h3>
                        <button onclick="deleteFromWatchlist(${item.id})">🗑 Eliminar</button>
                    </div>
                </div>
            `;

            container.appendChild(div);
        });
    });
}

function addToWatchlist(movie) {
    if(!token) {
        showToast("⚠️ Debes iniciar sesión para agregar a watchlist");
        return;
    } else {

    fetch(`${ruta}watchlist`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            tmdb_id: movie.id,
            title: movie.title,
            overview: movie.overview,
            poster_path: movie.poster_path,
            release_date: movie.release_date
        })
    })
    .then(res => {
        if (!res.ok) {
            showToast("⚠️ Ya está en watchlist");
        } else {
            showToast("Agregado a watchlist 📌");
        }
    });
    }
}

function deleteFromWatchlist(id) {
    fetch(`${ruta}watchlist/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    })
    .then(() => getWatchlist());
}

function showToast(message) {
    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.textContent = message;

    document.body.appendChild(toast);

    // activar animación
    setTimeout(() => toast.classList.add("show"), 10);

    // quitar después
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}
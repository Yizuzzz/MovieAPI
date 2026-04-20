const ruta = "https://movieapi-mwc0.onrender.com/movies/";

let token = localStorage.getItem("token") || null;

let debounceTimer;
const DEBOUNCE_DELAY = 400;

let currentEditId = null;
let currentMovieToSave = null;

let currentPage = 1;
const pageSize = 10;
let allFavorites = [];

function getAuthHeaders() {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

function clearSections() {
    document.getElementById("view-search").innerHTML = "";
    document.getElementById("view-favorites").innerHTML = "";
    document.getElementById("view-watchlist").innerHTML = "";
}

function showSkeleton(containerId, count = 8) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const div = document.createElement("div");
        div.classList.add("skeleton-card");

        div.innerHTML = `
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text" style="width: 60%"></div>
        `;

        container.appendChild(div);
    }
}

function showLogin() {
    closeAuthModals();
    document.getElementById("login-modal").classList.remove("hidden");
}

function showRegister() {
    closeAuthModals();
    document.getElementById("register-modal").classList.remove("hidden");
}

function closeAuthModals() {
    document.getElementById("login-modal").classList.add("hidden");
    document.getElementById("register-modal").classList.add("hidden");
}

// 🔁 Switch entre modales
function switchToRegister() {
    document.getElementById("login-modal").classList.add("hidden");
    document.getElementById("register-modal").classList.remove("hidden");
}

function switchToLogin() {
    document.getElementById("register-modal").classList.add("hidden");
    document.getElementById("login-modal").classList.remove("hidden");
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
    .then(async res => {
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.detail || "Error en login");
        }

        return data;
    })
    .then(data => {
        const token = data.access_token;

        if (!token) {
            throw new Error("Token no recibido");
        }

        localStorage.setItem("token", token);

        showToast("Login exitoso ✅");

        closeAuthModals();
        updateAuthUI();
        clearSections();

        document.getElementById("login-email").value = "";
        document.getElementById("login-password").value = "";
    })
    .catch(err => {
        console.error(err);
        showToast(err.message || "Error de conexión ❌");
    });
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
    .then(async res => {
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.detail || "Error en registro");
        }

        return data;
    })
    .then(() => {
        showToast("Usuario creado 🎉");

        document.getElementById("register-username").value = "";
        document.getElementById("register-email").value = "";
        document.getElementById("register-password").value = "";

        switchToLogin();
    })
    .catch(err => {
        console.error(err);
        showToast(err.message || "Error en registro");
    });
}

function logout() {
    localStorage.removeItem("token")

    showToast("Sesión cerrada 👋");

    updateAuthUI();
    clearSections();
}

function updateAuthUI() {
    const token = localStorage.getItem("token");

    const loginBtn = document.getElementById("login-btn");
    const registerBtn = document.getElementById("register-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const favoritesBtn = document.getElementById("favorites-btn");
    const watchlistBtn = document.getElementById("watchlist-btn");

    if (!loginBtn || !registerBtn || !logoutBtn || !favoritesBtn || !watchlistBtn) {
        console.error("Elementos de auth no encontrados");
        return;
    }

    if (token) {
        // 🔐 Usuario logueado
        loginBtn.classList.add("hidden");
        registerBtn.classList.add("hidden");

        logoutBtn.classList.remove("hidden");
        favoritesBtn.classList.remove("hidden");
        watchlistBtn.classList.remove("hidden");

    } else {
        // 🚪 Usuario NO logueado
        loginBtn.classList.remove("hidden");
        registerBtn.classList.remove("hidden");

        logoutBtn.classList.add("hidden");
        favoritesBtn.classList.add("hidden");
        watchlistBtn.classList.add("hidden");
    }
}

updateAuthUI();

function searchMovies() {
    showView("search");

    const resultsDiv = document.getElementById("view-search");
    resultsDiv.innerHTML = "";


    document.getElementById("view-favorites").innerHTML = "";
    clearSections();

    const query = document.getElementById("movie-name").value;
    if (!query.trim()) return;

    showSkeleton("view-search");

    fetch(`${ruta}search?q=` + query)
        .then(response => response.json())
        .then(data => {
            const resultsDiv = document.getElementById("view-search");
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
                    openSaveModal(movie);
                });

                const watchBtn = movieDiv.querySelector(".watch-btn");

                watchBtn.addEventListener("click", () => {
                    addToWatchlist(movie);
                ;});

                resultsDiv.appendChild(movieDiv);
            });
        })
        .catch(error => console.error("Error fetching movies:", error));
}

let isSaving = false;

let lastQuery = "";

function handleSearchInput(event) {
    const query = event.target.value;

    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        if (query.trim() !== "" && query !== lastQuery) {
            lastQuery = query;
            searchMovies();
        }
    }, DEBOUNCE_DELAY);
}

function saveFavorite(movie) {
    if(!token) {
        showToast("⚠️ Debes iniciar sesión para guardar favoritos");
        return Promise.resolve(false);
    }

    const ratingInput = prompt("Califica la película (1-5):");
    if (ratingInput === null) return Promise.resolve(false);

    const rating = parseFloat(ratingInput);
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

function showView(viewName) {
    document.querySelectorAll(".view").forEach(v => {
        v.classList.add("hidden");
    });

    document.getElementById(`view-${viewName}`).classList.remove("hidden");

    // 👇 ocultar buscador si no es search
    const searchBox = document.querySelector(".search-container");
    searchBox.style.display = viewName === "search" ? "block" : "none";
}

function loadFavorites() {
    showView("favorites");

    const container = document.getElementById("view-favorites");
    container.innerHTML = "";

    showSkeleton("view-favorites");

    fetch(`${ruta}favorites`, {
        headers: getAuthHeaders()
    })
    .then(res => {
        if (!res.ok) throw new Error("No autorizado");
        return res.json();
    })
    .then(data => {
        container.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            showEmptyState(
                "view-favorites",
                "Sin favoritos ⭐",
                "Aún no has agregado películas"
            );
            return;
        }

        data.forEach(fav => {
            const movieDiv = document.createElement("div");
            movieDiv.classList.add("favorite-movie");

            movieDiv.innerHTML = `
                <div class="card">
                    <img src="https://image.tmdb.org/t/p/w300${fav.movie.poster_path}" alt="${fav.movie.title}">
                    
                    <div class="overlay">
                        <h3>${fav.movie.title}</h3>
                        <p>⭐ Rating: ${fav.rating}</p>
                        <p>📝 ${fav.review ?? "Sin reseña"}</p>

                        <button class="update-btn">✏️ Editar</button>
                        <button class="delete-btn">🗑 Eliminar</button>
                    </div>
                </div>
            `;

            // ✅ EDITAR
            movieDiv.querySelector(".update-btn")
                .addEventListener("click", () => openEditModal(fav));

            // ✅ ELIMINAR (FIX IMPORTANTE)
            movieDiv.querySelector(".delete-btn")
                .addEventListener("click", () => deleteFavorite(fav.id));

            container.appendChild(movieDiv);
        });
    })
    .catch(err => {
        console.error(err);

        showEmptyState(
            "view-favorites",
            "Error de autenticación 🔒",
            "Inicia sesión para ver tus favoritos"
        );
    });
}

function loadWatchlist() {
    showView("watchlist");

    const container = document.getElementById("view-watchlist");
    container.innerHTML = "";

    showSkeleton("view-watchlist");

    fetch(`${ruta}watchlist`, {
        headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("view-watchlist");
        container.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            showEmptyState(
                "view-watchlist",
                "Tu watchlist está vacía 📌.",
                "Guarda películas para ver después."
            );
            return;
        }

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

function getFavorites() {
    document.getElementById("view-search").innerHTML = "";
    clearSections();

    fetch(`${ruta}favorites`, {
        headers: getAuthHeaders()
    })
        .then(response => response.json())
        .then(data => {
            const favoritesDiv = document.getElementById("view-favorites");
            favoritesDiv.innerHTML = "";

            data.forEach(fav => {
                
            });
        })
        .catch(error => console.error("Error fetching favorites:", error));
}

function openEditModal(fav) {
    currentEditId = fav.id;

    document.getElementById("edit-rating").value = fav.rating || "";
    document.getElementById("edit-review").value = fav.review || "";

    document.getElementById("edit-modal").classList.remove("hidden");

    document.getElementById("edit-modal").addEventListener("click", (e) => {
        if (e.target.id === "edit-modal") {
            closeModal();
        }
    });
}

function closeModal() {
    document.getElementById("edit-modal").classList.add("hidden");
}

function submitEdit() {
    const rating = parseFloat(document.getElementById("edit-rating").value);
    const review = document.getElementById("edit-review").value;

    if (isNaN(rating) || rating < 0 || rating > 5) {
        alert("Rating inválido (0-5)");
        return;
    }

    fetch(`${ruta}favorites/${currentEditId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            rating: rating,
            review: review
        })
    })
    .then(res => res.json())
    .then(() => {
        closeModal();
        showToast("Película actualizada ✨");
        getFavorites();
    })
    .catch(err => {
        console.error(err);
        alert("Error al actualizar");
    });
}

function openSaveModal(movie) {
    if (!token) {
        showToast("⚠️ Debes iniciar sesión para guardar favoritos");
        return;
    }

    currentMovieToSave = movie;

    document.getElementById("save-rating").value = "";
    document.getElementById("save-review").value = "";

    document.getElementById("save-modal").classList.remove("hidden");

    document.getElementById("save-modal").addEventListener("click", (e) => {
        if (e.target.id === "save-modal") {
            closeSaveModal();
        }
    });
}

function closeSaveModal() {
    document.getElementById("save-modal").classList.add("hidden");
}

function submitSaveFavorite() {
    const saveButton = document.querySelector("#save-modal .btn-primary");
    saveButton.disabled = true;
    const rating = parseFloat(document.getElementById("save-rating").value);
    const review = document.getElementById("save-review").value;

    if (isNaN(rating) || rating < 1 || rating > 5) {
        showToast("⚠️ Rating inválido (1-5)");
        return;
    }

    fetch(`${ruta}favorites`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            tmdb_id: currentMovieToSave.id,
            title: currentMovieToSave.title,
            overview: currentMovieToSave.overview,
            poster_path: currentMovieToSave.poster_path,
            release_date: currentMovieToSave.release_date,
            rating: rating,
            review: review ? review.trim() : null
        })
    })
    .then(res => {
        if (!res.ok) {
            showToast("⚠️ Ya está en favoritos o error");
            return;
        }

        showToast("Película agregada ⭐");
        closeSaveModal();

        // animación opcional después de guardar
        const cards = document.querySelectorAll(".card");
        cards.forEach(card => {
            if (card.innerHTML.includes(currentMovieToSave.title)) {
                card.classList.add("pop");
                setTimeout(() => card.classList.remove("pop"), 300);
            }
        });
    })
    .catch(() => showToast("Error de conexión ❌"));
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
    document.getElementById("view-search").innerHTML = "";
    document.getElementById("view-favorites").innerHTML = "";
    clearSections();

    fetch(`${ruta}watchlist`, {
        headers: getAuthHeaders()
    })
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById("view-watchlist");
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
    const token = localStorage.getItem("token"); // 👈 SIEMPRE leer fresco

    if (!token) {
        showToast("⚠️ Debes iniciar sesión para agregar a watchlist");
        return;
    }

    fetch(`${ruta}watchlist`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            tmdb_id: movie.id,
            title: movie.title,
            overview: movie.overview,
            poster_path: movie.poster_path,
            release_date: movie.release_date
        })
    })
    .then(async res => {
        const data = await res.json().catch(() => null);

        if (res.status === 401) {
            showToast("⚠️ Sesión expirada, vuelve a iniciar sesión");
            return;
        }

        if (res.status === 409) {
            showToast("⚠️ Ya está en watchlist");
            return;
        }

        if (!res.ok) {
            showToast("Error al agregar ❌");
            return;
        }

        showToast("Agregado a watchlist 📌");
    })
    .catch(() => {
        showToast("Error de conexión ❌");
    });
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

function showEmptyState(containerId, title, message) {
    const container = document.getElementById(containerId);

    container.innerHTML = `
        <div class="empty-state">
            <h3>${title}</h3>
            <p>${message}</p>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    updateAuthUI();
});

document.getElementById("movie-name")
    .addEventListener("input", handleSearchInput);
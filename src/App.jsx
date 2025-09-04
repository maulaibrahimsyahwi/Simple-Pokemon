import { useState, useEffect } from "react";
import Pokemons from "./components/PokemonList/PokemonList";
import Login from "./components/Login";
import ScrollToTopButton from "./components/ScrollToTopButton/ScrollToTopButton"; // --- 1. IMPORT KOMPONEN BARU ---
import "./app.css";

function App() {
  const [isLogin, setIsLogin] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  useEffect(() => {
    if (isLogin) {
      localStorage.setItem("isLoggedIn", "true");
    } else {
      localStorage.removeItem("isLoggedIn");
    }
  }, [isLogin]);

  const handleLogout = () => {
    // --- TAMBAHKAN BARIS INI ---
    localStorage.removeItem("pokemonData"); // Membersihkan cache data Pokemon
    setIsLogin(false);
  };

  return (
    <div className="app-container">
      {isLogin ? (
        <>
          <div className="header">
            <h1>Simple Pokémon</h1>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
          <Pokemons />
        </>
      ) : (
        <Login setIsLogin={setIsLogin} />
      )}
      <ScrollToTopButton />
    </div>
  );
}

export default App;

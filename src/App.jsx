import { useState, useEffect } from "react";
import Pokemons from "./components/PokemonList/PokemonList";
import Login from "./components/Login/Login";
import ScrollToTopButton from "./components/ScrollToTopButton/ScrollToTopButton";
import { useTranslation } from "react-i18next";
import "./app.css";

function App() {
  const { t, i18n } = useTranslation();
  const [isLogin, setIsLogin] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  // State baru untuk menangani loading awal setelah login
  const [isInitialLoad, setIsInitialLoad] = useState(false);

  useEffect(() => {
    if (isLogin) {
      localStorage.setItem("isLoggedIn", "true");
    } else {
      localStorage.removeItem("isLoggedIn");
    }
  }, [isLogin]);

  const handleLogout = () => {
    // PERBAIKAN: Menghapus baris yang menghapus data Pokémon dari localStorage
    setIsLogin(false);
  };

  // Fungsi login yang diperbarui
  const handleLoginSuccess = () => {
    setIsLogin(true);
    // HANYA SET isInitialLoad JIKA DATA TIDAK ADA DI LOCALSTORAGE
    if (!localStorage.getItem("pokemonData")) {
      setIsInitialLoad(true);
    } else {
      setIsInitialLoad(false);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="app-container">
      {isLogin ? (
        <>
          <div className="header">
            <h1>{t("appTitle")}</h1>
            {/* PERBAIKAN: Mengelompokkan tombol logout dan language-switcher */}
            <div className="header-controls">
              <div className="language-switcher">
                <button
                  onClick={() => changeLanguage("en")}
                  className={i18n.language === "en" ? "active" : ""}
                >
                  EN
                </button>
                <button
                  onClick={() => changeLanguage("id")}
                  className={i18n.language === "id" ? "active" : ""}
                >
                  ID
                </button>
              </div>
              <button onClick={handleLogout} className="logout-button">
                {t("logoutButton")}
              </button>
            </div>
          </div>
          {/* Meneruskan prop isInitialLoad */}
          <Pokemons
            isInitialLoad={isInitialLoad}
            setIsInitialLoad={setIsInitialLoad}
          />
        </>
      ) : (
        <Login setIsLogin={handleLoginSuccess} />
      )}
      <ScrollToTopButton />
    </div>
  );
}

export default App;

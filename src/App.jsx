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

  useEffect(() => {
    if (isLogin) {
      localStorage.setItem("isLoggedIn", "true");
    } else {
      localStorage.removeItem("isLoggedIn");
    }
  }, [isLogin]);

  const handleLogout = () => {
    localStorage.removeItem("pokemonData");
    setIsLogin(false);
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

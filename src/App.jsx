// Tidak ada perubahan dari kode perbaikan sebelumnya
import { useState, useEffect } from "react";
import Pokemons from "./components/PokemonList/PokemonList";
import Login from "./components/Login/Login";
import ScrollToTopButton from "./components/ScrollToTopButton/ScrollToTopButton";
import PokemonComparison from "./components/PokemonComparison/PokemonComparison";
import { useTranslation } from "react-i18next";
import usePokemonData from "./hooks/usePokemonData";
import "./app.css";

function App() {
  const { t, i18n } = useTranslation();
  const [isLogin, setIsLogin] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [selectedPokemons, setSelectedPokemons] = useState([]);
  const [view, setView] = useState("list");

  const pokemonData = usePokemonData();

  useEffect(() => {
    if (isLogin) {
      localStorage.setItem("isLoggedIn", "true");
    } else {
      localStorage.removeItem("isLoggedIn");
    }
  }, [isLogin]);

  const handleLogout = () => {
    setIsLogin(false);
  };

  const handleLoginSuccess = () => {
    setIsLogin(true);
    if (!localStorage.getItem("pokemonData")) {
      setIsInitialLoad(true);
    } else {
      setIsInitialLoad(false);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleAddForComparison = (pokemon) => {
    setSelectedPokemons((prev) =>
      prev.length < 2
        ? [...prev, pokemon]
        : (alert(t("comparisonLimitMessage")), prev)
    );
  };

  const handleRemoveFromComparison = (pokemonToRemove) => {
    setSelectedPokemons((prev) =>
      prev.filter((pokemon) => pokemon.id !== pokemonToRemove.id)
    );
  };

  const handleCompareClick = () => {
    if (selectedPokemons.length === 2) {
      setView("compare");
    } else {
      alert(t("selectTwoPokemonsMessage"));
    }
  };

  const handleClearComparison = () => {
    setSelectedPokemons([]);
    setView("list");
    // Panggilan ini sekarang akan bekerja dengan benar
    pokemonData.loadPokemons();
  };

  return (
    <div
      className={`app-container ${view === "compare" ? "comparison-page" : ""}`}
    >
      {isLogin ? (
        <>
          <div
            className={`header ${view === "compare" ? "static-header" : ""}`}
          >
            <div className="header-left-controls">
              {view === "list" && (
                <button
                  className="compare-button"
                  onClick={handleCompareClick}
                  disabled={selectedPokemons.length !== 2}
                >
                  {t("compareButton")} ({selectedPokemons.length}/2)
                </button>
              )}
              {view === "compare" && (
                <button
                  className="compare-button back-to-list-button"
                  onClick={handleClearComparison}
                >
                  {t("backButton")}
                </button>
              )}
            </div>
            <h1>{t("appTitle")}</h1>
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
          {view === "list" && (
            <Pokemons
              {...pokemonData}
              isInitialLoad={isInitialLoad}
              setIsInitialLoad={setIsInitialLoad}
              onAddForComparison={handleAddForComparison}
              onRemoveFromComparison={handleRemoveFromComparison}
              selectedPokemons={selectedPokemons}
            />
          )}
          {view === "compare" && (
            <PokemonComparison selectedPokemons={selectedPokemons} />
          )}
        </>
      ) : (
        <Login setIsLogin={handleLoginSuccess} />
      )}
      <ScrollToTopButton />
    </div>
  );
}

export default App;

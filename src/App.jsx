import { useState, useEffect } from "react";
import Pokemons from "./components/PokemonList/PokemonList";
import Login from "./components/Login/Login";
import ScrollToTopButton from "./components/ScrollToTopButton/ScrollToTopButton";
import PokemonComparison from "./components/PokemonComparison/PokemonComparison";
import { useTranslation } from "react-i18next";
import "./app.css";

function App() {
  const { t, i18n } = useTranslation();
  const [isLogin, setIsLogin] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [selectedPokemons, setSelectedPokemons] = useState([]);
  const [view, setView] = useState("list"); // 'list' atau 'compare'

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
    if (selectedPokemons.length < 2) {
      setSelectedPokemons((prev) => [...prev, pokemon]);
    } else {
      alert(t("comparisonLimitMessage"));
    }
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
  };

  return (
    <div className="app-container">
      {isLogin ? (
        <>
          <div className="header">
            <div className="header-left-controls">
              <button
                className="compare-button"
                onClick={handleCompareClick}
                disabled={selectedPokemons.length !== 2}
              >
                {t("compareButton")} ({selectedPokemons.length}/2)
              </button>
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
              isInitialLoad={isInitialLoad}
              setIsInitialLoad={setIsInitialLoad}
              onAddForComparison={handleAddForComparison}
              selectedPokemons={selectedPokemons}
            />
          )}
          {view === "compare" && (
            <PokemonComparison
              selectedPokemons={selectedPokemons}
              onClearComparison={handleClearComparison}
            />
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

import { useState, useEffect } from "react";
import Pokemons from "./components/PokemonList/PokemonList";
import Login from "./components/Login/Login";
import ScrollToTopButton from "./components/ScrollToTopButton/ScrollToTopButton";
import PokemonComparison from "./components/PokemonComparison/PokemonComparison";
import { useTranslation } from "react-i18next";
import usePokemonData from "./hooks/usePokemonData";
import { IoLogOutOutline } from "react-icons/io5"; // Import ikon Logout
import { FaCodeCompare } from "react-icons/fa6"; // Import ikon Compare
import "./app.css";

function App() {
  const { t, i18n } = useTranslation();
  const [isLogin, setIsLogin] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [selectedPokemons, setSelectedPokemons] = useState([]);
  const [view, setView] = useState("list");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  const pokemonData = usePokemonData();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    pokemonData.loadPokemons();
  };

  return (
    <div
      className={`app-container ${view === "compare" ? "comparison-page" : ""}`}
    >
      {isLogin ? (
        <>
          <div className="header">
            {/* Bagian Kiri: Tombol Bandingkan */}
            <div className="header-left-controls">
              {view === "list" && (
                <button
                  className="compare-button"
                  onClick={handleCompareClick}
                  disabled={selectedPokemons.length !== 2}
                >
                  {isMobile ? (
                    <>
                      <FaCodeCompare />
                      <span className="compare-count-mobile">
                        ({selectedPokemons.length}/2)
                      </span>
                    </>
                  ) : (
                    <>
                      {t("compareButton")} ({selectedPokemons.length}/2)
                    </>
                  )}
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

            {/* Bagian Tengah: Judul */}
            <div className="header-center-controls">
              <h1>{t("appTitle")}</h1>
            </div>

            {/* Bagian Kanan: Bahasa & Tombol Logout */}
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
                {isMobile ? <IoLogOutOutline /> : t("logoutButton")}
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

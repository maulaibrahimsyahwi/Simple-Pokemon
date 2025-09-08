import { useState, useEffect, useRef } from "react";
import Pokemons from "./components/PokemonList/PokemonList";
import Login from "./components/Login/Login";
import ScrollToTopButton from "./components/ScrollToTopButton/ScrollToTopButton";
import PokemonComparison from "./components/PokemonComparison/PokemonComparison";
import PokemonDetailOverlay from "./components/PokemonDetailOverlay/PokemonDetailOverlay";
import { useTranslation } from "react-i18next";
import usePokemonData from "./hooks/usePokemonData";
import { IoLogOutOutline } from "react-icons/io5";
import { FaCodeCompare } from "react-icons/fa6";
import { FaLanguage } from "react-icons/fa";
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
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedPokemonForDetails, setSelectedPokemonForDetails] =
    useState(null);
  const languageRef = useRef(null);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [languageRef]);

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
    setShowLanguageDropdown(false);
  };

  const handleAddForComparison = (pokemon) => {
    setSelectedPokemons((prev) => {
      if (prev.length < 2) {
        return [...prev, pokemon];
      } else {
        alert(t("comparisonLimitMessage"));
        return prev;
      }
    });
  };

  const handleRemoveFromComparison = (pokemonToRemove) => {
    setSelectedPokemons((prev) =>
      prev.filter((pokemon) => pokemon.id !== pokemonToRemove.id)
    );
  };

  const handleCompareClick = () => {
    if (selectedPokemons.length === 2) {
      setView("compare");
      setSelectedPokemonForDetails(null); // Tutup overlay saat transisi
    } else {
      alert(t("selectTwoPokemonsMessage"));
    }
  };

  const handleClearComparison = () => {
    setSelectedPokemons([]);
    setView("list");
    pokemonData.loadPokemons();
  };

  const toggleLanguageDropdown = () => {
    setShowLanguageDropdown((prev) => !prev);
  };

  const handleShowDetails = (details) => {
    setSelectedPokemonForDetails(details);
  };

  const handleCloseDetails = () => {
    setSelectedPokemonForDetails(null);
  };

  return (
    <div
      className={`app-container ${view === "compare" ? "comparison-page" : ""}`}
    >
      {isLogin ? (
        <>
          <div className="header">
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

            <div className="header-center-controls">
              <h1>{t("appTitle")}</h1>
            </div>

            <div className="header-controls">
              {isMobile ? (
                <div className="language-dropdown-container" ref={languageRef}>
                  <button
                    className="language-toggle-button"
                    onClick={toggleLanguageDropdown}
                  >
                    <FaLanguage />
                  </button>
                  {showLanguageDropdown && (
                    <div className="language-dropdown">
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
                  )}
                </div>
              ) : (
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
              )}
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
              onShowDetails={handleShowDetails}
            />
          )}
          {view === "compare" && (
            <PokemonComparison selectedPokemons={selectedPokemons} />
          )}
          {selectedPokemonForDetails && (
            <PokemonDetailOverlay
              evolutionLine={selectedPokemonForDetails.evolutionLine}
              initialIndex={selectedPokemonForDetails.initialIndex}
              initialFormIndex={selectedPokemonForDetails.initialFormIndex}
              onClose={handleCloseDetails}
              selectedPokemons={selectedPokemons}
              onAddForComparison={handleAddForComparison}
              onRemoveFromComparison={handleRemoveFromComparison}
              onGoToCompare={handleCompareClick} // Prop baru
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

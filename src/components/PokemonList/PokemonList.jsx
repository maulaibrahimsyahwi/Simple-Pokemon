import { useState, useEffect, useRef, useCallback } from "react";
import PokemonItem from "../PokemonItem/PokemonItem";
import usePokemonData from "../../hooks/usePokemonData";
import PokemonCardSkeleton from "../PokemonItem/PokemonCardSkeleton/PokemonCardSkeleton";
import ErrorDisplay from "../ErrorDisplay/ErrorDisplay";
import "./PokemonList.css";
import NotfoundImage from "./img/Not Found Pokemon.webp";
import { useTranslation } from "react-i18next";

function Pokemons({
  isInitialLoad,
  setIsInitialLoad,
  onAddForComparison,
  onRemoveFromComparison,
  selectedPokemons,
}) {
  const { t } = useTranslation();
  const {
    loading,
    moreLoading,
    error,
    processedPokemons,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    gridSize,
    setGridSize,
    colours,
    searchSuggestions,
    loadMore,
    hasMore,
    loadPokemons,
    searchPokemon,
  } = usePokemonData();

  const listWrapperRef = useRef(null);
  const listRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);

  const observer = useRef();
  const lastPokemonElementRef = useCallback(
    (node) => {
      if (moreLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [moreLoading, hasMore, loadMore]
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const calculateScale = () => {
      if (listWrapperRef.current && listRef.current) {
        listRef.current.style.transform = "scale(1)";
        const wrapperWidth = listWrapperRef.current.offsetWidth;
        const listWidth = listRef.current.scrollWidth;
        const listHeight = listRef.current.scrollHeight;
        if (listWidth > wrapperWidth) {
          const scale = wrapperWidth / listWidth;
          listRef.current.style.transform = `scale(${scale})`;
          listWrapperRef.current.style.height = `${listHeight * scale}px`;
        } else {
          listRef.current.style.transform = "scale(1)";
          listWrapperRef.current.style.height = `${listHeight}px`;
        }
      }
    };
    const timeoutId = setTimeout(calculateScale, 0);
    window.addEventListener("resize", calculateScale);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", calculateScale);
    };
  }, [gridSize, isMobile, processedPokemons, loading]);

  useEffect(() => {
    if (!loading && processedPokemons.length > 0 && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [loading, processedPokemons, isInitialLoad, setIsInitialLoad]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
    if (e.target.value === "") {
      loadPokemons(filterType);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery) {
      searchPokemon(searchQuery);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (name) => {
    setSearchQuery(name);
    searchPokemon(name);
    setShowSuggestions(false);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setSearchQuery("");
    loadPokemons(type);
  };

  return (
    <>
      <form
        className="search-container-with-suggestions"
        onSubmit={handleSearchSubmit}
      >
        <input
          type="text"
          value={searchQuery}
          ref={searchInputRef}
          placeholder={t("searchPlaceholder")}
          className="search"
          onChange={handleSearchChange}
        />
        {showSuggestions && searchSuggestions.length > 0 && (
          <ul className="suggestions-list">
            {searchSuggestions.map((name, index) => (
              <li key={index} onClick={() => handleSuggestionClick(name)}>
                {name}
              </li>
            ))}
          </ul>
        )}
      </form>

      <div className="controls-container">
        <div className="filter-container">
          <strong>{t("filterByType")}</strong>
          <select
            className="type-dropdown"
            value={filterType}
            onChange={(e) => handleFilterChange(e.target.value)}
            style={{ "--type-color": colours[filterType] }}
          >
            <option value="all">{t("allType")}</option>
            {Object.keys(colours).map((type) => (
              <option key={type} value={type}>
                {t(type.charAt(0).toUpperCase() + type.slice(1))}
              </option>
            ))}
          </select>
          <div className="type-buttons">
            <button
              className={filterType === "all" ? "active" : ""}
              onClick={() => handleFilterChange("all")}
            >
              {t("allType")}
            </button>
            {Object.keys(colours).map((type) => (
              <button
                key={type}
                className={filterType === type ? "active" : ""}
                onClick={() => handleFilterChange(type)}
                style={{ "--type-color": colours[type] }}
              >
                {t(type.charAt(0).toUpperCase() + type.slice(1))}
              </button>
            ))}
          </div>
        </div>
        <div className="settings-container">
          {!isMobile && (
            <div className="grid-size-container">
              <strong>{t("columnSize")}</strong>
              <div className="grid-buttons">
                {[4, 5, 6, 7].map((size) => (
                  <button
                    key={size}
                    className={gridSize === size ? "active" : ""}
                    onClick={() => setGridSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="list-pokemon-wrapper" ref={listWrapperRef}>
        <div
          className="list-pokemon"
          ref={listRef}
          style={{ "--grid-size": isMobile ? 3 : gridSize }}
        >
          {error && !loading && <ErrorDisplay message={error} />}
          {!error && !loading && processedPokemons.length === 0 && (
            <div className="not-found-container">
              <img
                src={NotfoundImage}
                alt="Not Found"
                style={{ width: "350px", marginBottom: "20px" }}
              />
              <h2>{t("notFoundTitle")}</h2>
              <p>{t("notFoundMessage")}</p>
            </div>
          )}
          {processedPokemons.map((evolutionLine, index) => {
            if (processedPokemons.length === index + 1) {
              return (
                <div ref={lastPokemonElementRef} key={index}>
                  <PokemonItem
                    evolutionLine={evolutionLine}
                    onAddForComparison={onAddForComparison}
                    onRemoveFromComparison={onRemoveFromComparison}
                    selectedPokemons={selectedPokemons}
                  />
                </div>
              );
            } else {
              return (
                <PokemonItem
                  key={index}
                  evolutionLine={evolutionLine}
                  onAddForComparison={onAddForComparison}
                  onRemoveFromComparison={onRemoveFromComparison}
                  selectedPokemons={selectedPokemons}
                />
              );
            }
          })}

          {/* PERBAIKAN UTAMA ADA DI SINI */}
          {(loading || moreLoading) &&
            Array.from({ length: loading ? gridSize * 2 : gridSize }).map(
              (_, index) => <PokemonCardSkeleton key={`skeleton-${index}`} />
            )}
        </div>
      </div>
    </>
  );
}

export default Pokemons;

import { useState, useEffect, useRef } from "react";
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
    error,
    processedPokemons,
    setSearchQuery,
    filterType,
    setFilterType,
    sortByName,
    setSortByName,
    gridSize,
    setGridSize,
    colours,
  } = usePokemonData();

  const listWrapperRef = useRef(null);
  const listRef = useRef(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

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

  return (
    <>
      <input
        type="text"
        placeholder={t("searchPlaceholder")}
        className="search"
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="controls-container">
        <div className="filter-container">
          <strong>{t("filterByType")}</strong>
          <select
            className="type-dropdown"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
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
              onClick={() => setFilterType("all")}
            >
              {t("allType")}
            </button>
            {Object.keys(colours).map((type) => (
              <button
                key={type}
                className={filterType === type ? "active" : ""}
                onClick={() => setFilterType(type)}
                style={{ "--type-color": colours[type] }}
              >
                {t(type.charAt(0).toUpperCase() + type.slice(1))}
              </button>
            ))}
          </div>
        </div>
        <div className="settings-container">
          <div className="sort-container">
            <button onClick={() => setSortByName(!sortByName)}>
              {sortByName ? t("sortByName") : t("sortById")}
            </button>
          </div>
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
          {error ? (
            <ErrorDisplay message={t("errorMessage")} />
          ) : isInitialLoad || loading ? (
            Array.from({ length: 12 }).map((_, index) => (
              <PokemonCardSkeleton key={index} />
            ))
          ) : processedPokemons.length === 0 ? (
            <div className="not-found-container">
              <img
                src={NotfoundImage}
                alt="Not Found"
                style={{ width: "350px", marginBottom: "20px" }}
              />
              <h2>{t("notFoundTitle")}</h2>
              <p>{t("notFoundMessage")}</p>
            </div>
          ) : (
            processedPokemons.map((evolutionLine, index) => (
              <PokemonItem
                key={index}
                evolutionLine={evolutionLine}
                onAddForComparison={onAddForComparison}
                onRemoveFromComparison={onRemoveFromComparison}
                selectedPokemons={selectedPokemons}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default Pokemons;

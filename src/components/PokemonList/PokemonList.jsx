import { useState, useEffect, useRef, useCallback } from "react";
import PokemonItem from "../PokemonItem/PokemonItem";
import PokemonCardSkeleton from "../PokemonItem/PokemonCardSkeleton/PokemonCardSkeleton";
import ErrorDisplay from "../ErrorDisplay/ErrorDisplay";
import "./PokemonList.css";
import NotfoundImage from "./img/Not Found Pokemon.webp";
import { useTranslation } from "react-i18next";
import { RiArrowDropDownLine, RiCloseLine } from "react-icons/ri";

function Pokemons({
  isInitialLoad,
  setIsInitialLoad,
  onAddForComparison,
  onRemoveFromComparison,
  selectedPokemons,
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
  onShowDetails,
}) {
  const { t } = useTranslation();
  const listWrapperRef = useRef(null);
  const listRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);
  const filterDropdownRef = useRef(null);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const dropdownTimeoutRef = useRef(null);
  const [hoveredType, setHoveredType] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const suggestionsListRef = useRef(null);

  useEffect(() => {
    const storedHistory =
      JSON.parse(localStorage.getItem("searchHistory")) || [];
    setSearchHistory(storedHistory);
  }, []);

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

  useEffect(() => {
    if (highlightedIndex > -1 && suggestionsListRef.current) {
      const highlightedItem =
        suggestionsListRef.current.children[highlightedIndex];
      if (highlightedItem) {
        highlightedItem.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [highlightedIndex]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.length > 0 || searchHistory.length > 0);
    if (e.target.value === "") {
      loadPokemons(filterType);
    }
  };

  const updateSearchHistory = (query) => {
    const newHistory = [
      query,
      ...searchHistory.filter((item) => item !== query),
    ].slice(0, 3);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery) {
      searchPokemon(searchQuery);
      updateSearchHistory(searchQuery);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (name) => {
    setSearchQuery(name);
    searchPokemon(name);
    updateSearchHistory(name);
    setShowSuggestions(false);
  };

  const handleHistoryDelete = (e, itemToDelete) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter((item) => item !== itemToDelete);
    setSearchHistory(newHistory);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  const handleKeyDown = (e) => {
    const totalItems = searchHistory.length + searchSuggestions.length;
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prevIndex) => (prevIndex + 1) % totalItems);
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex(
        (prevIndex) => (prevIndex - 1 + totalItems) % totalItems
      );
    } else if (e.key === "Enter" && highlightedIndex > -1) {
      const selectedItem = [...searchHistory, ...searchSuggestions][
        highlightedIndex
      ];
      handleSuggestionClick(selectedItem);
    }
  };

  const handleFilterChange = (type, e) => {
    e.stopPropagation();
    setFilterType(type);
    setSearchQuery("");
    loadPokemons(type);
    setShowTypeDropdown(false);
  };

  const handleDropdownMouseEnter = () => {
    clearTimeout(dropdownTimeoutRef.current);
    dropdownTimeoutRef.current = setTimeout(() => {
      setShowTypeDropdown(true);
    }, 200);
  };

  const handleDropdownMouseLeave = () => {
    clearTimeout(dropdownTimeoutRef.current);
    dropdownTimeoutRef.current = setTimeout(() => {
      setShowTypeDropdown(false);
    }, 200);
  };

  const handleWrapperClick = (e) => {
    if (filterDropdownRef.current.contains(e.target)) {
      setShowTypeDropdown((prev) => !prev);
    }
  };

  return (
    <>
      <form
        className="search-container-with-suggestions"
        onSubmit={handleSearchSubmit}
        onKeyDown={handleKeyDown}
      >
        <input
          type="text"
          value={searchQuery}
          ref={searchInputRef}
          placeholder={t("searchPlaceholder")}
          className="search"
          onChange={handleSearchChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        {showSuggestions && (
          <ul className="suggestions-list" ref={suggestionsListRef}>
            {searchHistory.map((item, index) => (
              <li
                key={`history-${index}`}
                className={highlightedIndex === index ? "highlighted" : ""}
                onMouseDown={() => handleSuggestionClick(item)}
              >
                <span>{item}</span>
                <button
                  className="delete-history-button"
                  onMouseDown={(e) => handleHistoryDelete(e, item)}
                >
                  <RiCloseLine />
                </button>
              </li>
            ))}
            {searchSuggestions.map((name, index) => (
              <li
                key={index}
                className={
                  highlightedIndex === searchHistory.length + index
                    ? "highlighted"
                    : ""
                }
                onMouseDown={() => handleSuggestionClick(name)}
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </form>

      <div className="controls-container">
        {isMobile ? (
          <div className="mobile-controls-row">
            <div className="grid-size-container">
              <strong>{t("Size")}</strong>
              <div className="grid-buttons">
                {[2, 3].map((size) => (
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
            <div className="filter-container">
              <strong>{t("filterByType")}</strong>
              <select
                className="type-dropdown"
                value={filterType}
                onChange={(e) => {
                  const newType = e.target.value;
                  setFilterType(newType);
                  setSearchQuery("");
                  loadPokemons(newType);
                }}
                style={{ "--type-color": colours[filterType] }}
              >
                <option value="all">{t("allType")}</option>
                {Object.keys(colours).map((type) => (
                  <option key={type} value={type}>
                    {t(type.charAt(0).toUpperCase() + type.slice(1))}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <>
            <div className="filter-container">
              <strong>{t("filterByType")}</strong>
              <div
                className={`type-dropdown-wrapper ${
                  showTypeDropdown ? "active" : ""
                }`}
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}
                onClick={handleWrapperClick}
                ref={filterDropdownRef}
              >
                <button
                  type="button"
                  className={`type-dropdown-button ${
                    filterType !== "all" ? "active" : ""
                  }`}
                  style={{
                    backgroundColor:
                      filterType === "all" ? "#efefef" : colours[filterType],
                    color: filterType === "all" ? "#333" : "white",
                  }}
                >
                  {t(filterType.charAt(0).toUpperCase() + filterType.slice(1))}
                  <RiArrowDropDownLine className="dropdown-icon" />
                </button>
                {showTypeDropdown && (
                  <div className="type-dropdown-menu">
                    <div
                      key="all"
                      className={`type-dropdown-item ${
                        filterType === "all" ? "active" : ""
                      }`}
                      onClick={(e) => handleFilterChange("all", e)}
                      onMouseEnter={() => setHoveredType("all")}
                      onMouseLeave={() => setHoveredType(null)}
                      style={{
                        backgroundColor:
                          hoveredType === "all" || filterType === "all"
                            ? "#4a90e2"
                            : "#f0f0f0",
                        color:
                          hoveredType === "all" || filterType === "all"
                            ? "white"
                            : "#333",
                        borderColor:
                          hoveredType === "all" || filterType === "all"
                            ? "#3d7dca"
                            : "#ddd",
                      }}
                    >
                      {t("allType")}
                    </div>
                    {Object.keys(colours).map((type) => (
                      <div
                        key={type}
                        className={`type-dropdown-item ${
                          filterType === type ? "active" : ""
                        }`}
                        onClick={(e) => handleFilterChange(type, e)}
                        onMouseEnter={() => setHoveredType(type)}
                        onMouseLeave={() => setHoveredType(null)}
                        style={{
                          backgroundColor:
                            hoveredType === type || filterType === type
                              ? colours[type]
                              : "#f0f0f0",
                          color:
                            hoveredType === type || filterType === type
                              ? "white"
                              : "#333",
                          borderColor:
                            hoveredType === type || filterType === type
                              ? colours[type]
                              : "#ddd",
                        }}
                      >
                        {t(type.charAt(0).toUpperCase() + type.slice(1))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="settings-container">
              <div className="grid-size-container">
                <strong>{t("Size")}</strong>
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
            </div>
          </>
        )}
      </div>

      <div className="list-pokemon-wrapper" ref={listWrapperRef}>
        <div
          className="list-pokemon"
          ref={listRef}
          style={{ "--grid-size": gridSize }}
        >
          {loading && processedPokemons.length === 0 ? (
            Array.from({ length: gridSize * 2 }).map((_, index) => (
              <PokemonCardSkeleton key={index} />
            ))
          ) : (
            <>
              {error && !loading && <ErrorDisplay message={error} />}
              {!error && processedPokemons.length === 0 && (
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
              {processedPokemons.map((item, index) => {
                const itemKey = item.chainId
                  ? `${item.chainId}-${index}`
                  : index;

                if (processedPokemons.length === index + 1) {
                  return (
                    <div ref={lastPokemonElementRef} key={itemKey}>
                      <PokemonItem
                        evolutionLine={item.evolutionLine}
                        initialIndex={item.initialIndex}
                        initialBranchIndex={item.initialBranchIndex}
                        onAddForComparison={onAddForComparison}
                        onRemoveFromComparison={onRemoveFromComparison}
                        selectedPokemons={selectedPokemons}
                        onShowDetails={onShowDetails}
                      />
                    </div>
                  );
                } else {
                  return (
                    <PokemonItem
                      key={itemKey}
                      evolutionLine={item.evolutionLine}
                      initialIndex={item.initialIndex}
                      initialBranchIndex={item.initialBranchIndex}
                      onAddForComparison={onAddForComparison}
                      onRemoveFromComparison={onRemoveFromComparison}
                      selectedPokemons={selectedPokemons}
                      onShowDetails={onShowDetails}
                    />
                  );
                }
              })}
              {moreLoading &&
                Array.from({ length: gridSize * 1 }).map((_, index) => (
                  <PokemonCardSkeleton key={index} />
                ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Pokemons;

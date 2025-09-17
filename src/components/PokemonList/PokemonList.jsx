// src/components/PokemonList/PokemonList.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import PokemonItem from "../PokemonItem/PokemonItem";
import PokemonCardSkeleton from "../PokemonItem/PokemonCardSkeleton/PokemonCardSkeleton";
import ErrorDisplay from "../ErrorDisplay/ErrorDisplay";
import Search from "./Search";
import Filter from "./Filter";
// Hapus import LoadingMore jika tidak digunakan lagi di file ini
// import LoadingMore from "../LoadingMore/LoadingMore";
import "./PokemonList.css";
import NotfoundImage from "./img/Not Found Pokemon.webp";
import { useTranslation } from "react-i18next";

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
  loadCount,
  // setLoadCount, // setLoadCount tidak lagi diperlukan di sini
}) {
  const { t } = useTranslation();
  const listWrapperRef = useRef(null);
  const listRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const [showSuggestions, setShowSuggestions] = useState(false);
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

      if (loadCount < 6) {
        observer.current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadMore();
          }
        });

        if (node) observer.current.observe(node);
      }
    },
    [moreLoading, hasMore, loadMore, loadCount]
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

  return (
    <>
      <div onKeyDown={handleKeyDown}>
        <Search
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearchSubmit={handleSearchSubmit}
          showSuggestions={showSuggestions}
          suggestionsListRef={suggestionsListRef}
          searchHistory={searchHistory}
          highlightedIndex={highlightedIndex}
          handleSuggestionClick={handleSuggestionClick}
          handleHistoryDelete={handleHistoryDelete}
          searchSuggestions={searchSuggestions}
          setShowSuggestions={setShowSuggestions}
          loadPokemons={loadPokemons}
          filterType={filterType}
        />
      </div>
      <Filter
        isMobile={isMobile}
        gridSize={gridSize}
        setGridSize={setGridSize}
        filterType={filterType}
        setFilterType={setFilterType}
        colours={colours}
        loadPokemons={loadPokemons}
        setSearchQuery={setSearchQuery}
      />

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
              {!error && processedPokemons.length === 0 && !loading && (
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
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Pokemons;

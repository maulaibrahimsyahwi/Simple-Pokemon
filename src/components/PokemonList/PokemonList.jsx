import { useState, useEffect, useRef } from "react";
import PokemonItem from "../PokemonItem/PokemonItem";
import usePokemonData from "../../hooks/usePokemonData";
import PokemonCardSkeleton from "../PokemonItem/PokemonCardSkeleton";
import "./PokemonList.css";
import NotfoundImage from "./img/Not Found Pokemon.webp";

function Pokemons() {
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

  // --- PERUBAHAN 1: Tambahkan state untuk deteksi mobile ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // --- PERUBAHAN 2: Tambahkan useEffect untuk handle resize ---
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener("resize", handleResize);
    // Cleanup listener saat komponen di-unmount
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
  }, [gridSize, isMobile, processedPokemons, loading]); // Tambahkan isMobile sebagai dependency

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <input
        type="text"
        placeholder="Search pokemon..."
        className="search"
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="controls-container">
        <div className="filter-container">
          <strong>Filter by Type:</strong>

          <select
            className="type-dropdown"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ "--type-color": colours[filterType] }}
          >
            <option value="all">All</option>
            {Object.keys(colours).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <div className="type-buttons">
            <button
              className={filterType === "all" ? "active" : ""}
              onClick={() => setFilterType("all")}
            >
              All
            </button>
            {Object.keys(colours).map((type) => (
              <button
                key={type}
                className={filterType === type ? "active" : ""}
                onClick={() => setFilterType(type)}
                style={{ "--type-color": colours[type] }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div className="settings-container">
          <div className="sort-container">
            <button onClick={() => setSortByName(!sortByName)}>
              {sortByName ? "Sort by ID" : "Sort by Name"}
            </button>
          </div>

          {/* --- PERUBAHAN 3: Sembunyikan jika isMobile true --- */}
          {!isMobile && (
            <div className="grid-size-container">
              <strong>Column Size:</strong>
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
          // --- PERUBAHAN 4: Atur grid size menjadi 3 jika mobile ---
          style={{ "--grid-size": isMobile ? 3 : gridSize }}
        >
          {loading ? (
            Array.from({ length: 12 }).map((_, index) => (
              <PokemonCardSkeleton key={index} />
            ))
          ) : processedPokemons.length === 0 ? (
            <div className="not-found-container">
              <img
                src={NotfoundImage}
                alt="Not Found"
                style={{ width: "150px", marginBottom: "10px" }}
              />
            </div>
          ) : (
            processedPokemons.map((evolutionLine) => (
              <PokemonItem
                key={evolutionLine[0].id}
                evolutionLine={evolutionLine}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default Pokemons;

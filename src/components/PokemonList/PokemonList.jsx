import { useEffect, useRef } from "react"; // --- IMPORT HOOKS BARU ---
import PokemonItem from "../PokemonItem/PokemonItem";
import usePokemonData from "../../hooks/usePokemonData";
import PokemonCardSkeleton from "../PokemonItem/PokemonCardSkeleton";
import "./PokemonList.css";

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

  // --- TAMBAHKAN REFS UNTUK MENGUKUR ELEMEN ---
  const listWrapperRef = useRef(null);
  const listRef = useRef(null);

  // --- TAMBAHKAN USEEFFECT UNTUK LOGIKA ZOOM ---
  useEffect(() => {
    const calculateScale = () => {
      if (listWrapperRef.current && listRef.current) {
        // Reset transform untuk mendapatkan ukuran asli
        listRef.current.style.transform = "scale(1)";

        const wrapperWidth = listWrapperRef.current.offsetWidth;
        const listWidth = listRef.current.scrollWidth; // Gunakan scrollWidth untuk ukuran penuh
        const listHeight = listRef.current.scrollHeight;

        if (listWidth > wrapperWidth) {
          const scale = wrapperWidth / listWidth;
          listRef.current.style.transform = `scale(${scale})`;
          // Sesuaikan tinggi wrapper agar layout tidak rusak
          listWrapperRef.current.style.height = `${listHeight * scale}px`;
        } else {
          listRef.current.style.transform = "scale(1)";
          listWrapperRef.current.style.height = `${listHeight}px`;
        }
      }
    };

    // Panggil setelah render dan saat window di-resize
    const timeoutId = setTimeout(calculateScale, 0); // Beri jeda agar DOM ter-update
    window.addEventListener("resize", calculateScale);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", calculateScale);
    };
  }, [gridSize, processedPokemons, loading]); // Jalankan ulang jika grid, data, atau status loading berubah

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
        {/* ... (Kontrol filter) ... */}
        <div className="filter-container">
          <strong>Filter by Type:</strong>
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
          <div className="grid-size-container">
            <strong>Column Size:</strong>
            <div className="grid-buttons">
              {[3, 4, 5, 6].map((size) => (
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
      </div>

      {/* --- TAMBAHKAN WRAPPER DAN REF --- */}
      <div className="list-pokemon-wrapper" ref={listWrapperRef}>
        <div
          className="list-pokemon"
          ref={listRef}
          style={{ "--grid-size": gridSize }}
        >
          {loading ? (
            Array.from({ length: 12 }).map((_, index) => (
              <PokemonCardSkeleton key={index} />
            ))
          ) : processedPokemons.length === 0 ? (
            <div>No Pokémon found!</div>
          ) : (
            processedPokemons.map((pokemon) => (
              <PokemonItem key={pokemon.id} pokemon={pokemon} />
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default Pokemons;

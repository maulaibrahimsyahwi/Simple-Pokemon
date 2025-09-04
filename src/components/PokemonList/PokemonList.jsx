import PokemonItem from "../PokemonItem/PokemonItem";
import usePokemonData from "../../hooks/usePokemonData";
import PokemonCardSkeleton from "../PokemonItem/PokemonCardSkeleton"; // Impor komponen skeleton
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
    colours,
  } = usePokemonData();

  // Tampilkan pesan error jika ada
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

        <div className="sort-container">
          <button onClick={() => setSortByName(!sortByName)}>
            {sortByName ? "Sort by ID" : "Sort by Name"}
          </button>
        </div>
      </div>

      <div className="list-pokemon">
        {/* --- BAGIAN YANG DIPERBARUI --- */}
        {loading ? (
          // Tampilkan 12 kartu skeleton saat loading
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
        {/* --- AKHIR BAGIAN YANG DIPERBARUI --- */}
      </div>
    </>
  );
}

export default Pokemons;

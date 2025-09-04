import { useState, useEffect } from "react";
import PokemonItem from "../PokemonItem/PokemonItem";
import { colours } from "../../data/colours";
import "./PokemonList.css";

function Pokemons() {
  const [pokemons, setPokemons] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [sortByName, setSortByName] = useState(false);

  useEffect(() => {
    const fetchPokemons = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon?limit=300"
        );
        const data = await response.json();

        const pokemonDetails = await Promise.all(
          data.results.map(async (pokemon) => {
            const pokeResponse = await fetch(pokemon.url);
            const pokeData = await pokeResponse.json();
            const speciesResponse = await fetch(pokeData.species.url);
            const speciesData = await speciesResponse.json();
            const description = speciesData.flavor_text_entries.find(
              (entry) => entry.language.name === "en"
            );

            // --- INI BAGIAN PERBAIKANNYA ---
            const imageUrl =
              pokeData.sprites.other["official-artwork"].front_default ||
              pokeData.sprites.front_default; // Jika official-artwork tidak ada, gunakan front_default

            return {
              id: pokeData.id,
              name: pokeData.name,
              imageUrl: imageUrl, // Gunakan variabel yang sudah kita siapkan
              types: pokeData.types.map((typeInfo) => typeInfo.type.name),
              description: description
                ? description.flavor_text.replace(/\s+/g, " ")
                : "No description available.",
            };
          })
        );
        setPokemons(pokemonDetails);
      } catch (error) {
        console.error("Gagal mengambil data Pokemon:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPokemons();
  }, []);

  const processedPokemons = pokemons
    .filter((pokemon) => {
      if (filterType === "all") return true;
      return pokemon.types.includes(filterType);
    })
    .filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortByName) {
        return a.name.localeCompare(b.name);
      }
      return a.id - b.id;
    });

  if (loading) {
    return <div>Loading Pokemon...</div>;
  }

  return (
    <>
      <input
        type="text"
        placeholder="Search pokemon..."
        className="search"
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* --- INI BAGIAN PERUBAHANNYA --- */}
      <div className="controls-container">
        {/* Kontainer untuk Filter Elemen (sebelah kiri) */}
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

        {/* Tombol untuk Sorting (sebelah kanan) */}
        <div className="sort-container">
          <button onClick={() => setSortByName(!sortByName)}>
            {sortByName ? "Sort by ID" : "Sort by Name"}
          </button>
        </div>
      </div>
      {/* --- AKHIR BAGIAN PERUBAHAN --- */}

      <div className="list-pokemon">
        {processedPokemons.length === 0 ? (
          <div>No Pokémon found!</div>
        ) : (
          processedPokemons.map((pokemon) => (
            <PokemonItem key={pokemon.id} pokemon={pokemon} />
          ))
        )}
      </div>
    </>
  );
}

export default Pokemons;

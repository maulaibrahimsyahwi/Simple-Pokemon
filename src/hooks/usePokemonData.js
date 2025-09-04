import { useState, useEffect, useMemo } from "react";

const usePokemonData = () => {
  // ... (state yang sudah ada)
  const [pokemons, setPokemons] = useState(() => {
    const cachedData = localStorage.getItem("pokemonData");
    return cachedData ? JSON.parse(cachedData) : [];
  });

  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem("pokemonData");
  });

  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortByName, setSortByName] = useState(false);
  const [gridSize, setGridSize] = useState(4); // --- TAMBAHKAN STATE INI ---

  useEffect(() => {
    // ... (useEffect yang sudah ada)
    const fetchPokemons = async () => {
      if (pokemons.length > 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon?limit=500"
        );
        if (!response.ok) {
          throw new Error("Gagal mengambil data dari server.");
        }
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

            const imageUrl =
              pokeData.sprites.other["official-artwork"].front_default ||
              pokeData.sprites.front_default;

            return {
              id: pokeData.id,
              name: pokeData.name,
              imageUrl: imageUrl,
              types: pokeData.types.map((typeInfo) => typeInfo.type.name),
              description: description
                ? description.flavor_text.replace(/\s+/g, " ")
                : "No description available.",
            };
          })
        );
        setPokemons(pokemonDetails);
        localStorage.setItem("pokemonData", JSON.stringify(pokemonDetails));
      } catch (error) {
        console.error("Gagal mengambil data Pokemon:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemons();
  }, [pokemons.length]);

  const processedPokemons = useMemo(() => {
    // ... (useMemo yang sudah ada)
    return pokemons
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
  }, [pokemons, filterType, searchQuery, sortByName]);

  return {
    loading,
    error,
    processedPokemons,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    sortByName,
    setSortByName,
    gridSize, // --- EKSPOR STATE ---
    setGridSize, // --- EKSPOR FUNGSI SETTER ---
    colours: {
      normal: "#A8A77A",
      fire: "#EE8130",
      water: "#6390F0",
      electric: "#F7D02C",
      grass: "#7AC74C",
      ice: "#96D9D6",
      fighting: "#C22E28",
      poison: "#A33EA1",
      ground: "#E2BF65",
      flying: "#A98FF3",
      psychic: "#F95587",
      bug: "#A6B91A",
      rock: "#B6A136",
      ghost: "#735797",
      dragon: "#6F35FC",
      dark: "#705746",
      steel: "#B7B7CE",
      fairy: "#D685AD",
    },
  };
};

export default usePokemonData;

import { useState, useEffect, useMemo, useCallback } from "react";
import { colours } from "../data/colours"; // Impor dari file data

const usePokemonData = () => {
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
  const [sortByName, setSortByName] = useState(true); // Default diubah ke true
  const [gridSize, setGridSize] = useState(4);
  const [triggerFetch, setTriggerFetch] = useState(0);

  // Fungsi untuk memuat ulang data, dibungkus dengan useCallback
  const refetch = useCallback(() => {
    localStorage.removeItem("pokemonData");
    setPokemons([]);
    setTriggerFetch((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const fetchPokemons = async () => {
      const cachedData = localStorage.getItem("pokemonData");
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          if (
            Array.isArray(parsed) &&
            parsed.length > 0 &&
            !Array.isArray(parsed[0])
          ) {
            localStorage.removeItem("pokemonData");
          } else if (Array.isArray(parsed) && parsed.length > 0) {
            setPokemons(parsed);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Error parsing cached data:", err);
          localStorage.removeItem("pokemonData");
        }
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon-species?limit=501"
        );
        if (!response.ok) {
          throw new Error("Gagal mengambil data spesies dari server.");
        }
        const data = await response.json();

        const evolutionChains = await Promise.all(
          data.results.map(async (species) => {
            const speciesResponse = await fetch(species.url);
            const speciesData = await speciesResponse.json();
            const evolutionChainUrl = speciesData.evolution_chain.url;
            const evolutionResponse = await fetch(evolutionChainUrl);
            return await evolutionResponse.json();
          })
        );

        const uniqueChains = Array.from(
          new Set(evolutionChains.map((chain) => chain.id))
        ).map((id) => evolutionChains.find((chain) => chain.id === id));

        const pokemonDetails = await Promise.all(
          uniqueChains.map(async (chain) => {
            const evolutionLine = [];
            let current = chain.chain;
            while (current) {
              const pokemonName = current.species.name;
              const pokeResponse = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
              );

              if (pokeResponse.ok) {
                const pokeData = await pokeResponse.json();
                const speciesResponse = await fetch(pokeData.species.url);
                const speciesData = await speciesResponse.json();
                const description = speciesData.flavor_text_entries.find(
                  (entry) => entry.language.name === "en"
                );

                const imageUrl =
                  pokeData.sprites.other["official-artwork"].front_default ||
                  pokeData.sprites.front_default;

                const stats = {};
                pokeData.stats.forEach((stat) => {
                  stats[stat.stat.name] = stat.base_stat;
                });

                evolutionLine.push({
                  id: pokeData.id,
                  name: pokeData.name,
                  imageUrl: imageUrl,
                  types: pokeData.types.map((typeInfo) => typeInfo.type.name),
                  description: description
                    ? description.flavor_text.replace(/\s+/g, " ")
                    : "No description available.",
                  stats: stats,
                });
              }
              current = current.evolves_to[0];
            }
            return evolutionLine;
          })
        );

        const nonEmptyChains = pokemonDetails.filter(
          (chain) => chain.length > 0
        );
        setPokemons(nonEmptyChains);
        localStorage.setItem("pokemonData", JSON.stringify(nonEmptyChains));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemons();
  }, [triggerFetch]);

  const processedPokemons = useMemo(() => {
    return pokemons
      .filter((evolutionLine) => {
        if (!Array.isArray(evolutionLine)) return false;
        if (filterType === "all") return true;
        return evolutionLine.some((pokemon) =>
          pokemon.types.includes(filterType)
        );
      })
      .filter((evolutionLine) => {
        if (!Array.isArray(evolutionLine)) return false;
        return evolutionLine.some((pokemon) =>
          pokemon.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
      .sort((a, b) => {
        if (!a[0] || !b[0]) return 0;
        if (sortByName) {
          return a[0].name.localeCompare(b[0].name);
        }
        return a[0].id - b[0].id;
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
    gridSize,
    setGridSize,
    colours, // Ekspor warna dari data
    refetch, // Ekspor fungsi refetch
  };
};

export default usePokemonData;

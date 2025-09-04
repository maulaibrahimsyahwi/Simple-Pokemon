import { useState, useEffect, useMemo } from "react";

const usePokemonData = () => {
  const [pokemons, setPokemons] = useState(() => {
    const cachedData = localStorage.getItem("pokemonData");
    return cachedData ? JSON.parse(cachedData) : [];
  });

  const [loading, setLoading] = useState(() => {
    // Set loading ke true jika tidak ada data di cache
    return !localStorage.getItem("pokemonData");
  });

  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortByName, setSortByName] = useState(false);
  const [gridSize, setGridSize] = useState(4);

  useEffect(() => {
    const fetchPokemons = async () => {
      // Periksa format data cache dan hapus jika formatnya lama
      const cachedData = localStorage.getItem("pokemonData");
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          if (
            Array.isArray(parsed) &&
            parsed.length > 0 &&
            !Array.isArray(parsed[0])
          ) {
            console.log("Format data lama terdeteksi, membersihkan cache.");
            localStorage.removeItem("pokemonData");
          }
        } catch (err) {
          console.error("Gagal mem-parsing data cache:", err);
          localStorage.removeItem("pokemonData");
        }
      }

      // Jika data sudah ada dengan format yang benar, jangan fetch ulang
      if (pokemons.length > 0 && Array.isArray(pokemons[0])) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon-species?limit=500"
        );
        if (!response.ok) {
          throw new Error("Gagal mengambil data spesies dari server.");
        }
        const data = await response.json();

        // Ambil semua rantai evolusi
        const evolutionChains = await Promise.all(
          data.results.map(async (species) => {
            const speciesResponse = await fetch(species.url);
            const speciesData = await speciesResponse.json();
            const evolutionChainUrl = speciesData.evolution_chain.url;
            const evolutionResponse = await fetch(evolutionChainUrl);
            return await evolutionResponse.json();
          })
        );

        // Filter agar setiap rantai evolusi unik
        const uniqueChains = Array.from(
          new Set(evolutionChains.map((chain) => chain.id))
        ).map((id) => evolutionChains.find((chain) => chain.id === id));

        // Proses setiap rantai evolusi untuk mendapatkan detail Pokémon
        const pokemonDetails = await Promise.all(
          uniqueChains.map(async (chain) => {
            const evolutionLine = [];
            let current = chain.chain;
            while (current) {
              const pokemonName = current.species.name;
              const pokeResponse = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
              );

              // **PERBAIKAN UTAMA**: Tangani jika Pokémon tidak ditemukan (404)
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

                evolutionLine.push({
                  id: pokeData.id,
                  name: pokeData.name,
                  imageUrl: imageUrl,
                  types: pokeData.types.map((typeInfo) => typeInfo.type.name),
                  description: description
                    ? description.flavor_text.replace(/\s+/g, " ")
                    : "No description available.",
                });
              } else {
                console.warn(`Pokémon tidak ditemukan: ${pokemonName}`);
              }
              current = current.evolves_to[0];
            }
            return evolutionLine;
          })
        );
        // Hapus rantai evolusi yang kosong (jika semua Pokémon di dalamnya 404)
        const nonEmptyChains = pokemonDetails.filter(
          (chain) => chain.length > 0
        );
        setPokemons(nonEmptyChains);
        localStorage.setItem("pokemonData", JSON.stringify(nonEmptyChains));
      } catch (error) {
        console.error("Gagal mengambil data Pokemon:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemons();
  }, [pokemons]); // Tambahkan `pokemons` sebagai dependensi

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
        if (!a[0] || !b[0]) return 0; // Jaga-jaga jika ada array kosong
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

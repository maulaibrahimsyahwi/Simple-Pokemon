import { useState, useEffect, useCallback, useRef } from "react";
import i18n from "../i18n";

const useFetchPokemon = () => {
  const [pokemons, setPokemons] = useState(() => {
    const cachedData = localStorage.getItem("pokemonData");
    return cachedData ? JSON.parse(cachedData) : [];
  });
  const [initialLoading, setInitialLoading] = useState(
    () => !localStorage.getItem("pokemonData")
  );
  const [moreLoading, setMoreLoading] = useState(false);
  const [error, setError] = useState(null);
  const totalPokemonFetched = useRef(pokemons.length);
  const isFetchingRef = useRef(false);

  // Fungsi untuk mengambil detail evolusi dari serangkaian Pokémon
  const fetchPokemonDetails = async (pokemonList) => {
    const evolutionChains = await Promise.all(
      pokemonList.map(async (species) => {
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

            // PERBAIKAN UTAMA: Mencari deskripsi berdasarkan bahasa yang aktif
            const description = speciesData.flavor_text_entries.find(
              (entry) => entry.language.name === i18n.language // Gunakan i18n.language
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
              height: pokeData.height,
              weight: pokeData.weight,
            });
          }
          current = current.evolves_to[0];
        }
        return evolutionLine;
      })
    );

    return pokemonDetails.filter((chain) => chain.length > 0);
  };

  const fetchAllPokemon = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setError(null);
    try {
      // Ambil 500 spesies Pokémon pertama untuk muat awal
      const initialResponse = await fetch(
        "https://pokeapi.co/api/v2/pokemon-species?limit=500"
      );
      if (!initialResponse.ok) throw new Error("Gagal mengambil data awal.");
      const initialData = await initialResponse.json();
      const initialPokemons = await fetchPokemonDetails(initialData.results);
      setPokemons(initialPokemons);
      setInitialLoading(false);
      totalPokemonFetched.current = initialPokemons.length;

      // Ambil sisa data di latar belakang
      setMoreLoading(true);
      const remainingResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species?limit=1202&offset=500`
      );
      if (!remainingResponse.ok) throw new Error("Gagal mengambil sisa data.");
      const remainingData = await remainingResponse.json();
      const remainingPokemons = await fetchPokemonDetails(
        remainingData.results
      );
      setPokemons((prev) => [...prev, ...remainingPokemons]);
      setMoreLoading(false);
      localStorage.setItem(
        "pokemonData",
        JSON.stringify([...initialPokemons, ...remainingPokemons])
      );
    } catch (err) {
      setError(err.message);
      setInitialLoading(false);
      setMoreLoading(false);
    } finally {
      isFetchingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPokemons, setInitialLoading, setMoreLoading, setError, i18n.language]);

  const refetch = useCallback(() => {
    localStorage.removeItem("pokemonData");
    setPokemons([]);
    totalPokemonFetched.current = 0;
    setInitialLoading(true);
  }, []);

  useEffect(() => {
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
          setInitialLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error parsing cached data:", err);
        localStorage.removeItem("pokemonData");
      }
    }

    if (pokemons.length === 0 && initialLoading && !isFetchingRef.current) {
      fetchAllPokemon();
    }
  }, [initialLoading, pokemons.length, fetchAllPokemon]);

  return { pokemons, initialLoading, moreLoading, error, refetch };
};

export default useFetchPokemon;

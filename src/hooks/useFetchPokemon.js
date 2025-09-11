// src/hooks/useFetchPokemon.js
import { useState, useEffect, useCallback, useRef } from "react";
import { getCache, setCache } from "./usePokemonCache";
import {
  fetchPokemonDetails,
  fetchPokemonLocations,
  fetchPokemonWeaknesses,
} from "../API/pokemonAPI";

const useFetchPokemon = (allPokemonNames) => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moreLoading, setMoreLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const limit = 20;
  const hasMore = useRef(true);
  const isFetchingRef = useRef(false);
  const currentFilterType = useRef("all");
  const typePokemonNames = useRef([]);
  const loadedChainIds = useRef(new Set());

  const fetchPaginatedPokemons = useCallback(
    async (namesToFetch, currentPage, reset) => {
      isFetchingRef.current = true;
      if (reset) {
        setLoading(true);
        loadedChainIds.current.clear();
      } else {
        setMoreLoading(true);
      }

      try {
        if (namesToFetch.length === 0) {
          hasMore.current = false;
        } else {
          const speciesList = namesToFetch.map((name) => ({
            name,
            url: `https://pokeapi.co/api/v2/pokemon-species/${name}/`,
          }));

          const newPokemons = await fetchPokemonDetails(
            speciesList,
            loadedChainIds
          );
          setPokemons((prev) =>
            reset ? newPokemons : [...prev, ...newPokemons]
          );
          setPage(currentPage + 1);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setMoreLoading(false);
        isFetchingRef.current = false;
      }
    },
    []
  );

  const loadPokemons = useCallback(
    async (type = "all") => {
      currentFilterType.current = type;
      setPage(0);
      setPokemons([]);

      if (type === "all") {
        hasMore.current = true;
        if (allPokemonNames.length > 0) {
          const namesToFetch = allPokemonNames.slice(0, limit);
          fetchPaginatedPokemons(namesToFetch, 0, true);
        }
      } else {
        setLoading(true);
        isFetchingRef.current = true;
        setError(null);

        const cacheKey = `pokemons_type_names_${type}`;
        const cachedData = getCache(cacheKey);
        let pokemonsFromType;

        if (cachedData) {
          pokemonsFromType = cachedData;
        } else {
          try {
            const response = await fetch(
              `https://pokeapi.co/api/v2/type/${type}`
            );
            if (!response.ok)
              throw new Error("Failed to fetch data for this type.");
            const data = await response.json();
            pokemonsFromType = data.pokemon.map((p) => p.pokemon.name).sort();
            setCache(cacheKey, pokemonsFromType);
          } catch (err) {
            setError(err.message);
            setLoading(false);
            isFetchingRef.current = false;
            hasMore.current = false;
            return;
          }
        }
        typePokemonNames.current = pokemonsFromType;
        const namesToFetch = typePokemonNames.current.slice(0, limit);
        hasMore.current = typePokemonNames.current.length > limit;
        fetchPaginatedPokemons(namesToFetch, 0, true);
      }
    },
    [allPokemonNames, fetchPaginatedPokemons]
  );

  const searchPokemon = useCallback(
    async (name) => {
      if (!name) return;
      setLoading(true);
      setPokemons([]);
      isFetchingRef.current = true;
      setError(null);
      loadedChainIds.current.clear();

      const lowerCaseName = name.toLowerCase();
      const cacheKey = `pokemon_search_${lowerCaseName}`;
      const cachedData = getCache(cacheKey);
      if (cachedData) {
        setPokemons(cachedData);
        setLoading(false);
        isFetchingRef.current = false;
        hasMore.current = false;
        return;
      }

      const matchingNames = allPokemonNames.filter((pokemonName) =>
        pokemonName.toLowerCase().includes(lowerCaseName)
      );

      if (matchingNames.length === 0) {
        setPokemons([]);
        setLoading(false);
        isFetchingRef.current = false;
        hasMore.current = false;
        return;
      }

      try {
        const speciesList = matchingNames.map((p) => ({
          name: p,
          url: `https://pokeapi.co/api/v2/pokemon-species/${p}/`,
        }));

        const newPokemons = await fetchPokemonDetails(
          speciesList,
          loadedChainIds
        );
        setPokemons(newPokemons);
        setCache(cacheKey, newPokemons);
        hasMore.current = false;
      } catch (err) {
        setError(err.message);
        setPokemons([]);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [allPokemonNames]
  );

  const loadMore = useCallback(() => {
    if (isFetchingRef.current) return;
    if (currentFilterType.current === "all") {
      if (hasMore.current) {
        const start = page * limit;
        const end = start + limit;
        const namesToFetch = allPokemonNames.slice(start, end);
        hasMore.current = namesToFetch.length > 0;
        fetchPaginatedPokemons(namesToFetch, page, false);
      }
    } else {
      if (hasMore.current) {
        const start = page * limit;
        const end = start + limit;
        const namesToFetch = typePokemonNames.current.slice(start, end);
        hasMore.current = namesToFetch.length > 0;
        fetchPaginatedPokemons(namesToFetch, page, false);
      }
    }
  }, [page, allPokemonNames, fetchPaginatedPokemons]);

  useEffect(() => {
    if (allPokemonNames.length > 0) {
      loadPokemons("all");
    }
  }, [allPokemonNames, loadPokemons]);

  return {
    pokemons,
    loading,
    moreLoading,
    error,
    loadMore,
    hasMore: hasMore.current,
    loadPokemons,
    searchPokemon,
    fetchWeaknesses: fetchPokemonWeaknesses,
    fetchLocations: fetchPokemonLocations,
  };
};

export default useFetchPokemon;

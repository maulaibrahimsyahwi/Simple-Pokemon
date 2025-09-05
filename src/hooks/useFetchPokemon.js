import { useState, useEffect, useCallback, useRef } from "react";

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const getCache = (key) => {
  const cachedData = localStorage.getItem(key);
  if (!cachedData) return null;

  const { timestamp, data } = JSON.parse(cachedData);
  if (Date.now() - timestamp > CACHE_DURATION) {
    localStorage.removeItem(key);
    return null;
  }
  return data;
};

const setCache = (key, data) => {
  const cacheEntry = {
    timestamp: Date.now(),
    data,
  };
  localStorage.setItem(key, JSON.stringify(cacheEntry));
};

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
  const processedChainIds = useRef(new Set());

  const fetchPokemonDetails = async (pokemonList) => {
    const evolutionChains = await Promise.all(
      pokemonList.map(async (species) => {
        try {
          const speciesResponse = await fetch(species.url);
          if (!speciesResponse.ok) return null;
          const speciesData = await speciesResponse.json();
          const evolutionChainUrl = speciesData.evolution_chain.url;
          const evolutionResponse = await fetch(evolutionChainUrl);
          if (!evolutionResponse.ok) return null;
          return await evolutionResponse.json();
        } catch (e) {
          console.error(e);
          return null;
        }
      })
    );

    const validChains = evolutionChains.filter((chain) => chain !== null);

    const uniqueChains = validChains.filter((chain) => {
      if (!processedChainIds.current.has(chain.id)) {
        processedChainIds.current.add(chain.id);
        return true;
      }
      return false;
    });

    const pokemonDetails = await Promise.all(
      uniqueChains.map(async (chain) => {
        const pokemonNames = [];
        let current = chain.chain;
        while (current) {
          pokemonNames.push(current.species.name);
          current = current.evolves_to[0];
        }

        const pokemonDataArray = await Promise.all(
          pokemonNames.map(async (pokemonName) => {
            try {
              const pokeResponse = await fetch(
                `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
              );
              if (!pokeResponse.ok) return null;
              const pokeData = await pokeResponse.json();

              const speciesResponse = await fetch(pokeData.species.url);
              const speciesData = await speciesResponse.json();

              const descriptionEntry =
                speciesData.flavor_text_entries.find(
                  (entry) => entry.language.name === "en"
                ) || speciesData.flavor_text_entries[0];

              const imageUrl =
                pokeData.sprites.other["official-artwork"].front_default ||
                pokeData.sprites.front_default;

              const stats = {};
              pokeData.stats.forEach((stat) => {
                stats[stat.stat.name] = stat.base_stat;
              });

              return {
                id: pokeData.id,
                name: pokeData.name,
                imageUrl: imageUrl,
                types: pokeData.types.map((typeInfo) => typeInfo.type.name),
                description: descriptionEntry
                  ? descriptionEntry.flavor_text.replace(/\s+/g, " ")
                  : "No description available.",
                stats: stats,
                height: pokeData.height,
                weight: pokeData.weight,
              };
            } catch (e) {
              console.error(`Failed to fetch details for ${pokemonName}:`, e);
              return null;
            }
          })
        );

        return pokemonDataArray
          .filter((p) => p !== null)
          .sort((a, b) => a.id - b.id);
      })
    );
    return pokemonDetails.filter((chain) => chain.length > 0);
  };

  const fetchPokemonsByType = useCallback(async (type) => {
    const cacheKey = `pokemons_type_${type}`;
    const cachedPokemons = getCache(cacheKey);

    if (cachedPokemons) {
      setPokemons(cachedPokemons);
      setLoading(false);
    } else {
      setLoading(true);
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setError(null);

    if (!cachedPokemons) {
      setPokemons([]);
    }

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
      if (!response.ok) throw new Error("Failed to fetch data for this type.");
      const data = await response.json();
      const pokemonsFromType = data.pokemon.map((p) => ({
        ...p.pokemon,
        url: p.pokemon.url.replace("/pokemon/", "/pokemon-species/"),
      }));
      const newPokemons = await fetchPokemonDetails(pokemonsFromType);
      const sortedPokemons = newPokemons.sort((a, b) =>
        a[0].name.localeCompare(b[0].name)
      );
      setPokemons(sortedPokemons);
      setCache(cacheKey, sortedPokemons);
      hasMore.current = false;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  const fetchAlphabetizedPokemons = useCallback(
    async (currentPage, isInitialLoad = false) => {
      const cacheKey = `pokemons_all_page_${currentPage}`;
      if (isInitialLoad) {
        const allCachedPages = [];
        let hasAllCache = true;
        for (let i = 0; i <= currentPage; i++) {
          const pageCacheKey = `pokemons_all_page_${i}`;
          const cachedPage = getCache(pageCacheKey);
          if (cachedPage) {
            allCachedPages.push(...cachedPage);
          } else {
            hasAllCache = false;
            break;
          }
        }
        if (hasAllCache && allCachedPages.length > 0) {
          setPokemons(allCachedPages);
          setLoading(false);
        }
      }

      if (
        isFetchingRef.current ||
        !hasMore.current ||
        allPokemonNames.length === 0
      )
        return;
      isFetchingRef.current = true;
      setError(null);
      if (currentPage === 0) setLoading(true);
      else setMoreLoading(true);

      try {
        const start = currentPage * limit;
        const end = start + limit;
        const namesToFetch = allPokemonNames.slice(start, end);

        if (namesToFetch.length === 0) {
          hasMore.current = false;
        } else {
          const speciesList = namesToFetch.map((name) => ({
            name,
            url: `https://pokeapi.co/api/v2/pokemon-species/${name}/`,
          }));

          const newPokemons = await fetchPokemonDetails(speciesList);

          setCache(cacheKey, newPokemons);

          setPokemons((prev) => [...prev, ...newPokemons]);
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
    [allPokemonNames]
  );

  const searchPokemon = useCallback(async (name) => {
    if (!name) return;

    const cacheKey = `pokemon_search_${name.toLowerCase()}`;
    const cachedPokemon = getCache(cacheKey);

    if (cachedPokemon) {
      setPokemons(cachedPokemon);
      setLoading(false);
    } else {
      setLoading(true);
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    setError(null);
    if (!cachedPokemon) {
      setPokemons([]);
    }
    processedChainIds.current.clear();
    try {
      const pokeResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`
      );
      if (!pokeResponse.ok) {
        setPokemons([]);
        throw new Error("Pokemon not found.");
      }
      const pokeData = await pokeResponse.json();
      const speciesList = [
        { name: pokeData.species.name, url: pokeData.species.url },
      ];
      const foundPokemon = await fetchPokemonDetails(speciesList);
      setPokemons(foundPokemon);
      setCache(cacheKey, foundPokemon);
      hasMore.current = false;
    } catch (err) {
      setError(err.message);
      setPokemons([]);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  const loadPokemons = useCallback(
    (type = "all") => {
      processedChainIds.current.clear();
      currentFilterType.current = type;
      setError(null);
      setPokemons([]);
      setPage(0);
      if (type === "all") {
        hasMore.current = true;
        if (allPokemonNames.length > 0) {
          fetchAlphabetizedPokemons(0, true);
        }
      } else {
        fetchPokemonsByType(type);
      }
    },
    [fetchAlphabetizedPokemons, fetchPokemonsByType, allPokemonNames]
  );

  useEffect(() => {
    if (allPokemonNames.length > 0 && currentFilterType.current === "all") {
      loadPokemons("all");
    }
  }, [allPokemonNames, loadPokemons]);

  const loadMore = () => {
    if (currentFilterType.current === "all" && hasMore.current) {
      fetchAlphabetizedPokemons(page);
    }
  };

  return {
    pokemons,
    loading,
    moreLoading,
    error,
    loadMore,
    hasMore: hasMore.current,
    loadPokemons,
    searchPokemon,
  };
};

export default useFetchPokemon;

import { useState, useEffect, useCallback, useRef } from "react";

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 jam

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

  const fetchPokemonDetails = useCallback(async (pokemonList) => {
    // ... (implementasi sama seperti sebelumnya, tidak perlu diubah)
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
  }, []);

  const fetchPokemonsByType = useCallback(
    async (type) => {
      setLoading(true);
      setPokemons([]);
      isFetchingRef.current = true;
      setError(null);
      processedChainIds.current.clear();

      const cacheKey = `pokemons_type_${type}`;
      const cachedData = getCache(cacheKey);
      if (cachedData) {
        setPokemons(cachedData);
        setLoading(false);
        isFetchingRef.current = false;
        hasMore.current = false;
        return;
      }

      try {
        const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
        if (!response.ok)
          throw new Error("Failed to fetch data for this type.");
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
        setCache(cacheKey, sortedPokemons); // Simpan ke cache
        hasMore.current = false;
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [fetchPokemonDetails]
  );

  const fetchAlphabetizedPokemons = useCallback(
    async (currentPage, reset = false) => {
      if (isFetchingRef.current || (!hasMore.current && !reset)) return;

      isFetchingRef.current = true;
      setError(null);

      if (reset) setLoading(true);
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
    [allPokemonNames, fetchPokemonDetails]
  );

  const searchPokemon = useCallback(
    async (name) => {
      if (!name) return;
      setLoading(true);
      setPokemons([]);
      isFetchingRef.current = true;
      setError(null);
      processedChainIds.current.clear();

      const cacheKey = `pokemon_search_${name.toLowerCase()}`;
      const cachedData = getCache(cacheKey);
      if (cachedData) {
        setPokemons(cachedData);
        setLoading(false);
        isFetchingRef.current = false;
        hasMore.current = false;
        return;
      }

      try {
        const pokeResponse = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`
        );
        if (!pokeResponse.ok) {
          throw new Error("Pokemon not found.");
        }
        const pokeData = await pokeResponse.json();
        const speciesList = [
          { name: pokeData.species.name, url: pokeData.species.url },
        ];
        const foundPokemon = await fetchPokemonDetails(speciesList);
        setPokemons(foundPokemon);
        setCache(cacheKey, foundPokemon); // Simpan ke cache
        hasMore.current = false;
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [fetchPokemonDetails]
  );

  const loadPokemons = useCallback(
    (type = "all") => {
      processedChainIds.current.clear();
      currentFilterType.current = type;
      setPage(0);
      setPokemons([]);

      if (type === "all") {
        hasMore.current = true;
        if (allPokemonNames.length > 0) {
          fetchAlphabetizedPokemons(0, true);
        }
      } else {
        hasMore.current = false;
        fetchPokemonsByType(type);
      }
    },
    [allPokemonNames, fetchAlphabetizedPokemons, fetchPokemonsByType]
  );

  const fetchWeaknesses = useCallback(async (types) => {
    try {
      const typeRelations = {
        weaknesses: [],
        resistances: [],
        immunities: [],
      };

      const fetchedTypes = await Promise.all(
        types.map(async (typeName) => {
          const cacheKey = `type_relations_${typeName.toLowerCase()}`;
          const cachedData = getCache(cacheKey);
          if (cachedData) {
            return cachedData;
          } else {
            const response = await fetch(
              `https://pokeapi.co/api/v2/type/${typeName.toLowerCase()}`
            );
            if (!response.ok) return null;
            const data = await response.json();
            const relations = {
              weaknesses: data.damage_relations.double_damage_from.map(
                (t) => t.name
              ),
              resistances: data.damage_relations.half_damage_from.map(
                (t) => t.name
              ),
              immunities: data.damage_relations.no_damage_from.map(
                (t) => t.name
              ),
            };
            setCache(cacheKey, relations);
            return relations;
          }
        })
      );

      fetchedTypes.forEach((relations) => {
        if (relations) {
          typeRelations.weaknesses = [
            ...new Set([...typeRelations.weaknesses, ...relations.weaknesses]),
          ];
          typeRelations.resistances = [
            ...new Set([
              ...typeRelations.resistances,
              ...relations.resistances,
            ]),
          ];
          typeRelations.immunities = [
            ...new Set([...typeRelations.immunities, ...relations.immunities]),
          ];
        }
      });

      return typeRelations;
    } catch (e) {
      console.error("Failed to fetch type relations:", e);
      return { weaknesses: [], resistances: [], immunities: [] };
    }
  }, []);

  useEffect(() => {
    if (allPokemonNames.length > 0) {
      loadPokemons("all");
    }
  }, [allPokemonNames, loadPokemons]);

  const loadMore = useCallback(() => {
    if (
      currentFilterType.current === "all" &&
      hasMore.current &&
      !isFetchingRef.current
    ) {
      fetchAlphabetizedPokemons(page, false);
    }
  }, [page, fetchAlphabetizedPokemons]);

  return {
    pokemons,
    loading,
    moreLoading,
    error,
    loadMore,
    hasMore: hasMore.current,
    loadPokemons,
    searchPokemon,
    fetchWeaknesses,
  };
};

export default useFetchPokemon;

import { useState, useEffect, useCallback, useRef } from "react";

const CACHE_DURATION = 182 * 24 * 60 * 60 * 1000; // Kurang lebih 6 bulan

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

const fetchPokemonDetailsFromUrl = async (url, description) => {
  try {
    const pokeResponse = await fetch(url);
    if (!pokeResponse.ok) return null;
    const pokeData = await pokeResponse.json();

    const stats = {};
    pokeData.stats.forEach((stat) => {
      stats[stat.stat.name] = stat.base_stat;
    });

    const imageUrl =
      pokeData.sprites.other["official-artwork"].front_default ||
      pokeData.sprites.front_default;

    return {
      id: pokeData.id,
      name: pokeData.name,
      imageUrl: imageUrl,
      types: pokeData.types.map((typeInfo) => typeInfo.type.name),
      description: description || "No description available.",
      stats: stats,
      height: pokeData.height,
      weight: pokeData.weight,
      is_default: pokeData.is_default,
    };
  } catch (e) {
    console.error(`Failed to fetch details from URL ${url}:`, e);
    return null;
  }
};

const parseEvolutionChain = (chain) => {
  const stages = [];
  const traverse = (node, level) => {
    if (!stages[level]) {
      stages[level] = [];
    }
    stages[level].push(node.species.name);
    if (node.evolves_to.length > 0) {
      node.evolves_to.forEach((evolution) => {
        traverse(evolution, level + 1);
      });
    }
  };
  traverse(chain, 0);
  return stages;
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
  const typePokemonNames = useRef([]);
  const loadedChainIds = useRef(new Set()); // Tambahkan ref untuk melacak chain ID

  const fetchPokemonDetails = useCallback(async (pokemonList) => {
    const evolutionChains = await Promise.all(
      pokemonList.map(async (species) => {
        try {
          const speciesResponse = await fetch(species.url);
          if (!speciesResponse.ok) return null;
          const speciesData = await speciesResponse.json();
          const evolutionChainUrl = speciesData.evolution_chain.url;
          const evolutionResponse = await fetch(evolutionChainUrl);
          if (!evolutionResponse.ok) return null;
          return {
            ...(await evolutionResponse.json()),
            speciesData,
          };
        } catch (e) {
          console.error(e);
          return null;
        }
      })
    );

    const validChains = evolutionChains.filter((chain) => chain !== null);

    const uniqueChains = [];
    const chainsByIdInBatch = new Map();
    validChains.forEach((chain) => {
      // Periksa duplikat di dalam batch saat ini DAN duplikat dari batch sebelumnya
      if (
        !chainsByIdInBatch.has(chain.id) &&
        !loadedChainIds.current.has(chain.id)
      ) {
        chainsByIdInBatch.set(chain.id, chain);
        uniqueChains.push(chain);
      }
    });

    // Tambahkan chain ID yang baru diproses ke dalam set global
    uniqueChains.forEach((chain) => loadedChainIds.current.add(chain.id));

    const pokemonDetails = await Promise.all(
      uniqueChains.map(async (chain) => {
        const evolutionStages = parseEvolutionChain(chain.chain);
        const structuredEvolutionLine = await Promise.all(
          evolutionStages.map(async (stageNames, stageIndex) => {
            const pokemonsInStage = (
              await Promise.all(
                stageNames.map(async (pokemonName) => {
                  const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemonName}/`;
                  const speciesResponse = await fetch(speciesUrl);
                  const speciesData = await speciesResponse.json();
                  const descriptionEntry =
                    speciesData.flavor_text_entries.find(
                      (entry) => entry.language.name === "en"
                    ) || speciesData.flavor_text_entries[0];
                  const description = descriptionEntry
                    ? descriptionEntry.flavor_text.replace(/\s+/g, " ")
                    : "No description available.";
                  const varieties = (
                    await Promise.all(
                      speciesData.varieties.map((v) =>
                        fetchPokemonDetailsFromUrl(v.pokemon.url, description)
                      )
                    )
                  ).filter(Boolean);
                  return { id: varieties[0]?.id, name: pokemonName, varieties };
                })
              )
            ).filter((p) => p && p.varieties.length > 0);
            return { stage: stageIndex, pokemons: pokemonsInStage };
          })
        );

        const initialPokemonName = chain.speciesData.name;
        let initialIndex = 0;
        let initialBranchIndex = 0;

        structuredEvolutionLine.forEach((stage, stageIdx) => {
          const branchIdx = stage.pokemons.findIndex(
            (p) => p.name === initialPokemonName
          );
          if (branchIdx !== -1) {
            initialIndex = stageIdx;
            initialBranchIndex = branchIdx;
          }
        });

        return {
          chainId: chain.id,
          evolutionLine: structuredEvolutionLine.filter(
            (stage) => stage.pokemons.length > 0
          ),
          initialIndex,
          initialBranchIndex,
        };
      })
    );
    return pokemonDetails.filter((chain) => chain.evolutionLine.length > 0);
  }, []);

  const fetchPaginatedPokemons = useCallback(
    async (namesToFetch, currentPage, reset) => {
      isFetchingRef.current = true;
      if (reset) {
        setLoading(true);
        loadedChainIds.current.clear(); // Hapus cache ID saat reset/filter baru
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
    [fetchPokemonDetails]
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
      loadedChainIds.current.clear(); // Hapus cache ID saat pencarian baru

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

        const newPokemons = await fetchPokemonDetails(speciesList);
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
    [allPokemonNames, fetchPokemonDetails]
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

  const fetchLocations = useCallback(async (pokemonId) => {
    const cacheKey = `pokemon_locations_${pokemonId}`;
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemonId}/encounters`
      );
      if (!response.ok) return [];
      const data = await response.json();
      const locations = data.map((location) =>
        location.location_area.name.replace(/-/g, " ")
      );
      setCache(cacheKey, locations);
      return locations;
    } catch (e) {
      console.error("Failed to fetch pokemon locations:", e);
      return [];
    }
  }, []);

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
    fetchWeaknesses,
    fetchLocations,
  };
};

export default useFetchPokemon;

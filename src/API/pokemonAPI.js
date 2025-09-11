// src/api/pokemonAPI.js
import { getCache, setCache } from "../hooks/usePokemonCache";

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

export const fetchPokemonDetails = async (pokemonList, loadedChainIds) => {
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
    if (
      !chainsByIdInBatch.has(chain.id) &&
      !loadedChainIds.current.has(chain.id)
    ) {
      chainsByIdInBatch.set(chain.id, chain);
      uniqueChains.push(chain);
    }
  });

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
};

export const fetchPokemonWeaknesses = async (types) => {
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
            immunities: data.damage_relations.no_damage_from.map((t) => t.name),
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
          ...new Set([...typeRelations.resistances, ...relations.resistances]),
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
};

export const fetchPokemonLocations = async (pokemonId) => {
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
};

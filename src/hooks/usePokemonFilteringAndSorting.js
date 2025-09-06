import { useState, useMemo, useEffect } from "react";

const usePokemonFilteringAndSorting = (pokemons = []) => {
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [allPokemonNames, setAllPokemonNames] = useState([]);

  useEffect(() => {
    const fetchAllNames = async () => {
      try {
        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon-species?limit=1302"
        );
        if (!response.ok) throw new Error("Could not fetch names");
        const data = await response.json();
        setAllPokemonNames(data.results.map((p) => p.name));
      } catch (error) {
        console.error(
          "Failed to fetch all Pokemon names for suggestions:",
          error
        );
      }
    };
    fetchAllNames();
  }, []);

  const searchSuggestions = useMemo(() => {
    if (!searchQuery || allPokemonNames.length === 0) return [];

    return allPokemonNames
      .filter((name) => name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 10);
  }, [allPokemonNames, searchQuery]);

  // PERBAIKAN: Menghapus pengurutan berdasarkan ID
  const processedPokemons = useMemo(() => {
    return [...pokemons];
  }, [pokemons]);

  if (pokemons) {
    return {
      processedPokemons,
      allPokemonNamesSorted: allPokemonNames,
      searchQuery,
      setSearchQuery,
      filterType,
      setFilterType,
      searchSuggestions,
    };
  }

  return {
    allPokemonNamesSorted: allPokemonNames,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    searchSuggestions,
  };
};

export default usePokemonFilteringAndSorting;

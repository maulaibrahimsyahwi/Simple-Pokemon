import { useState, useMemo } from "react";

const usePokemonFilteringAndSorting = (pokemons) => {
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortByName, setSortByName] = useState(true);

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
    processedPokemons,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    sortByName,
    setSortByName,
  };
};

export default usePokemonFilteringAndSorting;

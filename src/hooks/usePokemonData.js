import { useState } from "react";
import { colours } from "../data/colours";
import useFetchPokemon from "./useFetchPokemon";
import usePokemonFilteringAndSorting from "./usePokemonFilteringAndSorting";

const usePokemonData = () => {
  const [gridSize, setGridSize] = useState(4);
  const { pokemons, loading, error } = useFetchPokemon();
  const {
    processedPokemons,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    sortByName,
    setSortByName,
    searchSuggestions, // Tambahkan ini
  } = usePokemonFilteringAndSorting(pokemons);

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
    colours,
    searchSuggestions, // Tambahkan ini
  };
};

export default usePokemonData;

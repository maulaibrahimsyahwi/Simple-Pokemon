// src/hooks/usePokemonData.js
import { useState } from "react";
import { colours } from "../data/colours";
import useFetchPokemon from "./useFetchPokemon";
import usePokemonFilteringAndSorting from "./usePokemonFilteringAndSorting";

const usePokemonData = () => {
  // Pastikan state gridSize ada di sini
  const [gridSize, setGridSize] = useState(window.innerWidth <= 640 ? 2 : 4);

  const {
    allPokemonNamesSorted,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    searchSuggestions,
  } = usePokemonFilteringAndSorting();

  const {
    pokemons,
    loading,
    moreLoading,
    error,
    loadMore,
    hasMore,
    loadPokemons,
    searchPokemon,
    fetchWeaknesses,
    fetchLocations,
    loadCount,
    setLoadCount,
  } = useFetchPokemon(allPokemonNamesSorted);

  const { processedPokemons } = usePokemonFilteringAndSorting(pokemons);

  return {
    loading,
    moreLoading,
    error,
    processedPokemons,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    gridSize,
    setGridSize,
    colours,
    searchSuggestions,
    loadMore,
    hasMore,
    loadPokemons,
    searchPokemon,
    fetchWeaknesses,
    fetchLocations,
    loadCount,
    setLoadCount,
  };
};

export default usePokemonData;

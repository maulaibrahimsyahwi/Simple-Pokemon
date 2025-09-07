import { useState } from "react";
import { colours } from "../data/colours";
import useFetchPokemon from "./useFetchPokemon";
import usePokemonFilteringAndSorting from "./usePokemonFilteringAndSorting";

const usePokemonData = () => {
  const [gridSize, setGridSize] = useState(window.innerWidth <= 640 ? 3 : 4);

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
    fetchLocations, // <-- Tambahkan ini
  } = useFetchPokemon(allPokemonNamesSorted);

  // `processedPokemons` dari sini sekarang sudah dijamin terurut dengan benar
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
    fetchLocations, // <-- Tambahkan ini
  };
};

export default usePokemonData;

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

  const allPokemonNamesSorted = useMemo(() => {
    return [...allPokemonNames].sort();
  }, [allPokemonNames]);

  const searchSuggestions = useMemo(() => {
    if (!searchQuery || allPokemonNames.length === 0) return [];

    return allPokemonNames
      .filter((name) => name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5);
  }, [allPokemonNames, searchQuery]);

  // **PERBAIKAN UTAMA ADA DI SINI**
  // Logika ini akan mengambil daftar Pokemon (yang mungkin tidak berurutan)
  // dan mengurutkannya kembali dengan benar berdasarkan nama evolusi pertama.
  const processedPokemons = useMemo(() => {
    return [...pokemons].sort((a, b) => {
      if (!a[0] || !b[0]) return 0;
      // Selalu bandingkan nama dari Pokemon pertama di setiap rantai evolusi
      return a[0].name.localeCompare(b[0].name);
    });
  }, [pokemons]); // Jalankan ulang setiap kali daftar 'pokemons' berubah

  // Jika 'pokemons' diberikan, kembalikan data yang sudah diproses
  if (pokemons) {
    return {
      processedPokemons,
      allPokemonNamesSorted,
      searchQuery,
      setSearchQuery,
      filterType,
      setFilterType,
      searchSuggestions,
    };
  }

  // Jika tidak, kembalikan data untuk inisialisasi
  return {
    allPokemonNamesSorted,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    searchSuggestions,
  };
};

export default usePokemonFilteringAndSorting;

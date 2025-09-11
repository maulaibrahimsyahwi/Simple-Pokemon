// src/components/PokemonList/Search.jsx
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { RiCloseLine } from "react-icons/ri";

function Search({
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  showSuggestions,
  suggestionsListRef,
  searchHistory,
  highlightedIndex,
  handleSuggestionClick,
  handleHistoryDelete,
  searchSuggestions,
  setShowSuggestions,
  loadPokemons,
  filterType,
}) {
  const { t } = useTranslation();
  const searchInputRef = useRef(null);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(e.target.value.length > 0 || searchHistory.length > 0);
    if (e.target.value === "") {
      loadPokemons(filterType);
    }
  };

  return (
    <form
      className="search-container-with-suggestions"
      onSubmit={handleSearchSubmit}
    >
      <input
        type="text"
        value={searchQuery}
        ref={searchInputRef}
        placeholder={t("searchPlaceholder")}
        className="search"
        onChange={handleSearchChange}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />
      {showSuggestions && (
        <ul className="suggestions-list" ref={suggestionsListRef}>
          {searchHistory.map((item, index) => (
            <li
              key={`history-${index}`}
              className={highlightedIndex === index ? "highlighted" : ""}
              onMouseDown={() => handleSuggestionClick(item)}
            >
              <span>{item}</span>
              <button
                className="delete-history-button"
                onMouseDown={(e) => handleHistoryDelete(e, item)}
              >
                <RiCloseLine />
              </button>
            </li>
          ))}
          {searchSuggestions.map((name, index) => (
            <li
              key={index}
              className={
                highlightedIndex === searchHistory.length + index
                  ? "highlighted"
                  : ""
              }
              onMouseDown={() => handleSuggestionClick(name)}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

export default Search;

import { useState } from "react";
import "./PokemonItem.css";
import { colours } from "../../data/colours";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { useTranslation } from "react-i18next";

function PokemonItem({
  evolutionLine,
  onAddForComparison,
  onRemoveFromComparison,
  selectedPokemons,
}) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const handleNext = (event) => {
    event.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % evolutionLine.length);
  };

  const handlePrev = (event) => {
    event.stopPropagation();
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + evolutionLine.length) % evolutionLine.length
    );
  };

  const toggleDetails = (event) => {
    event.stopPropagation();
    setShowDetails((prev) => !prev);
  };

  const pokemon = evolutionLine[currentIndex];
  const mainType = pokemon.types[0].toLowerCase();
  const cardBackgroundColor = colours[mainType];
  const isSelected = selectedPokemons.some((p) => p.id === pokemon.id);

  const handleAddClick = (event) => {
    event.stopPropagation();
    if (isSelected) {
      onRemoveFromComparison(pokemon);
    } else {
      onAddForComparison(pokemon);
    }
  };

  const renderStats = (pokemon) => {
    if (!pokemon.stats) return null;
    return (
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-name hp">HP</span>
          <span className="stat-value">{pokemon.stats["hp"]}</span>
        </div>
        <div className="stat-item">
          <span className="stat-name atk">ATK</span>
          <span className="stat-value">{pokemon.stats["attack"]}</span>
        </div>
        <div className="stat-item">
          <span className="stat-name def">DEF</span>
          <span className="stat-value">{pokemon.stats["defense"]}</span>
        </div>
        <div className="stat-item">
          <span className="stat-name sp-atk">SP.ATK</span>
          <span className="stat-value">{pokemon.stats["special-attack"]}</span>
        </div>
        <div className="stat-item">
          <span className="stat-name sp-def">SP.DEF</span>
          <span className="stat-value">{pokemon.stats["special-defense"]}</span>
        </div>
        <div className="stat-item">
          <span className="stat-name speed">SPEED</span>
          <span className="stat-value">{pokemon.stats["speed"]}</span>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`pokemon-card ${isSelected ? "selected" : ""}`}
      style={{
        backgroundColor: `${cardBackgroundColor}aa`,
      }}
    >
      <div className="card-header">
        <div className="pokemon-measurements">
          <span className="measurement-tag">
            {t("height")} {pokemon.height / 10} m
          </span>
          <span className="measurement-tag">
            {t("weight")} {pokemon.weight / 10} kg
          </span>
        </div>
        {evolutionLine.length > 1 && (
          <div className="evolution-controls top-controls">
            <button onClick={handlePrev}>
              <MdArrowBackIos className="evolution-icon" />
            </button>
            <span>
              {currentIndex + 1} / {evolutionLine.length}
            </span>
            <button onClick={handleNext}>
              <MdArrowForwardIos className="evolution-icon" />
            </button>
          </div>
        )}
      </div>

      <img
        src={pokemon.imageUrl}
        alt={pokemon.name}
        className="pokemon-image"
      />
      <h1 style={{ textTransform: "capitalize" }}>{pokemon.name}</h1>
      <div className="types-container">
        {pokemon.types.map((type, index) => (
          <span
            key={index}
            className="type-badge"
            style={{ backgroundColor: colours[type.toLowerCase()] }}
          >
            {type}
          </span>
        ))}
      </div>

      <div className="card-actions">
        <button
          className={`add-compare-button ${isSelected ? "remove" : ""}`}
          onClick={handleAddClick}
          disabled={!isSelected && selectedPokemons.length >= 2}
        >
          {isSelected ? t("removeFromCompare") : t("addToCompare")}
        </button>

        <button className="details-toggle-button" onClick={toggleDetails}>
          {showDetails ? t("hideDetails") : t("showDetails")}
        </button>
      </div>

      <div className={`details-overlay ${showDetails ? "show" : ""}`}>
        <div className="details-content">
          <p>{pokemon.description}</p>
          {pokemon.stats && <>{renderStats(pokemon)}</>}
        </div>
        <button className="details-close-button" onClick={toggleDetails}>
          {t("hideDetails")}
        </button>
      </div>
    </div>
  );
}

export default PokemonItem;

import { useState, useRef } from "react";
import "./PokemonItem.css";
import { colours } from "../../data/colours";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import StatGrid from "../../StatGrid/StatGrid";
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
  const [showPrevTooltip, setShowPrevTooltip] = useState(false);
  const [showNextTooltip, setShowNextTooltip] = useState(false);

  // Menggunakan useRef untuk menyimpan ID timeout
  const prevTooltipTimeoutRef = useRef(null);
  const nextTooltipTimeoutRef = useRef(null);

  const handleNext = (event) => {
    event.stopPropagation();
    if (currentIndex < evolutionLine.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrev = (event) => {
    event.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const toggleDetails = () => {
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

  const handlePrevMouseEnter = () => {
    prevTooltipTimeoutRef.current = setTimeout(() => {
      setShowPrevTooltip(true);
    }, 500); // Delay 500 ms
  };

  const handlePrevMouseLeave = () => {
    clearTimeout(prevTooltipTimeoutRef.current);
    setShowPrevTooltip(false);
  };

  const handleNextMouseEnter = () => {
    nextTooltipTimeoutRef.current = setTimeout(() => {
      setShowNextTooltip(true);
    }, 500); // Delay 500 ms
  };

  const handleNextMouseLeave = () => {
    clearTimeout(nextTooltipTimeoutRef.current);
    setShowNextTooltip(false);
  };

  return (
    <div
      className={`pokemon-card ${isSelected ? "selected" : ""}`}
      style={{
        backgroundColor: `${cardBackgroundColor}aa`,
      }}
      onClick={toggleDetails}
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
            <span
              className="evolution-tooltip-wrapper"
              onMouseEnter={handlePrevMouseEnter}
              onMouseLeave={handlePrevMouseLeave}
            >
              <button onClick={handlePrev} disabled={currentIndex === 0}>
                <MdArrowBackIos className="evolution-icon" />
              </button>
              {showPrevTooltip && (
                <span className="evolution-tooltip">{t("tooltipPrev")}</span>
              )}
            </span>
            <span>
              {currentIndex + 1} / {evolutionLine.length}
            </span>
            <span
              className="evolution-tooltip-wrapper"
              onMouseEnter={handleNextMouseEnter}
              onMouseLeave={handleNextMouseLeave}
            >
              <button
                onClick={handleNext}
                disabled={currentIndex === evolutionLine.length - 1}
              >
                <MdArrowForwardIos className="evolution-icon" />
              </button>
              {showNextTooltip && (
                <span className="evolution-tooltip">{t("tooltipNext")}</span>
              )}
            </span>
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

        <button
          className="details-toggle-button"
          onClick={(e) => {
            e.stopPropagation();
            toggleDetails();
          }}
        >
          {showDetails ? t("hideDescription") : t("showDescription")}
        </button>
      </div>

      <div className={`details-overlay ${showDetails ? "show" : ""}`}>
        <div className="details-content">
          <p>{pokemon.description}</p>
          {pokemon.stats && <StatGrid stats={pokemon.stats} />}
        </div>
        <button
          className="details-close-button"
          onClick={(e) => {
            e.stopPropagation();
            toggleDetails();
          }}
        >
          {t("hideDescription")}
        </button>
      </div>
    </div>
  );
}

export default PokemonItem;

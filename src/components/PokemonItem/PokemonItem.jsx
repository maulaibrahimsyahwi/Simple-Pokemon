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

  // State untuk mengontrol slider bentuk
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [showPrevFormTooltip, setShowPrevFormTooltip] = useState(false);
  const [showNextFormTooltip, setShowNextFormTooltip] = useState(false);

  // Menggunakan useRef untuk menyimpan ID timeout
  const prevTooltipTimeoutRef = useRef(null);
  const nextTooltipTimeoutRef = useRef(null);
  const prevFormTooltipTimeoutRef = useRef(null);
  const nextFormTooltipTimeoutRef = useRef(null);

  const handleNext = (event) => {
    event.stopPropagation();
    if (currentIndex < evolutionLine.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setCurrentFormIndex(0); // Reset bentuk ke 0 saat evolusi berubah
    }
  };

  const handlePrev = (event) => {
    event.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
      setCurrentFormIndex(0); // Reset bentuk ke 0 saat evolusi berubah
    }
  };

  const handleNextForm = (event) => {
    event.stopPropagation();
    if (currentFormIndex < pokemon.varieties.length - 1) {
      setCurrentFormIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrevForm = (event) => {
    event.stopPropagation();
    if (currentFormIndex > 0) {
      setCurrentFormIndex((prevIndex) => prevIndex - 1);
    }
  };

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  const pokemon = evolutionLine[currentIndex];
  // Ambil data pokemon dari array varieties jika ada
  const displayedPokemon =
    pokemon.varieties && pokemon.varieties[currentFormIndex]
      ? pokemon.varieties[currentFormIndex]
      : pokemon;

  const mainType = displayedPokemon.types[0].toLowerCase();
  const cardBackgroundColor = colours[mainType];
  const isSelected = selectedPokemons.some((p) => p.id === displayedPokemon.id);
  const isLastEvolution = currentIndex === evolutionLine.length - 1;
  const hasMultipleForms =
    isLastEvolution && pokemon.varieties && pokemon.varieties.length > 1;

  const handleAddClick = (event) => {
    event.stopPropagation();
    if (isSelected) {
      onRemoveFromComparison(displayedPokemon);
    } else {
      onAddForComparison(displayedPokemon);
    }
  };

  const handlePrevMouseEnter = () => {
    prevTooltipTimeoutRef.current = setTimeout(() => {
      setShowPrevTooltip(true);
    }, 500);
  };

  const handlePrevMouseLeave = () => {
    clearTimeout(prevTooltipTimeoutRef.current);
    setShowPrevTooltip(false);
  };

  const handleNextMouseEnter = () => {
    nextTooltipTimeoutRef.current = setTimeout(() => {
      setShowNextTooltip(true);
    }, 500);
  };

  const handleNextMouseLeave = () => {
    clearTimeout(nextTooltipTimeoutRef.current);
    setShowNextTooltip(false);
  };

  // Event handler untuk tooltip bentuk
  const handlePrevFormMouseEnter = () => {
    prevFormTooltipTimeoutRef.current = setTimeout(() => {
      setShowPrevFormTooltip(true);
    }, 500);
  };

  const handlePrevFormMouseLeave = () => {
    clearTimeout(prevFormTooltipTimeoutRef.current);
    setShowPrevFormTooltip(false);
  };

  const handleNextFormMouseEnter = () => {
    nextFormTooltipTimeoutRef.current = setTimeout(() => {
      setShowNextFormTooltip(true);
    }, 500);
  };

  const handleNextFormMouseLeave = () => {
    clearTimeout(nextFormTooltipTimeoutRef.current);
    setShowNextFormTooltip(false);
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
            {t("height")} {displayedPokemon.height / 10} m
          </span>
          <span className="measurement-tag">
            {t("weight")} {displayedPokemon.weight / 10} kg
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
        src={displayedPokemon.imageUrl}
        alt={displayedPokemon.name}
        className="pokemon-image"
      />
      <h1 style={{ textTransform: "capitalize" }}>{displayedPokemon.name}</h1>
      <div className="types-container">
        {displayedPokemon.types.map((type, index) => (
          <span
            key={index}
            className="type-badge"
            style={{ backgroundColor: colours[type.toLowerCase()] }}
          >
            {type}
          </span>
        ))}
      </div>

      {hasMultipleForms && (
        <div className="evolution-controls bottom-controls">
          <span
            className="evolution-tooltip-wrapper"
            onMouseEnter={handlePrevFormMouseEnter}
            onMouseLeave={handlePrevFormMouseLeave}
          >
            <button onClick={handlePrevForm} disabled={currentFormIndex === 0}>
              <MdArrowBackIos className="evolution-icon" />
            </button>
            {showPrevFormTooltip && (
              <span className="evolution-tooltip">{t("tooltipPrevForm")}</span>
            )}
          </span>
          <span>
            Bentuk {currentFormIndex + 1} / {pokemon.varieties.length}
          </span>
          <span
            className="evolution-tooltip-wrapper"
            onMouseEnter={handleNextFormMouseEnter}
            onMouseLeave={handleNextFormMouseLeave}
          >
            <button
              onClick={handleNextForm}
              disabled={currentFormIndex === pokemon.varieties.length - 1}
            >
              <MdArrowForwardIos className="evolution-icon" />
            </button>
            {showNextFormTooltip && (
              <span className="evolution-tooltip">{t("tooltipNextForm")}</span>
            )}
          </span>
        </div>
      )}

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
          <p>{displayedPokemon.description}</p>
          {displayedPokemon.stats && (
            <StatGrid stats={displayedPokemon.stats} />
          )}
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

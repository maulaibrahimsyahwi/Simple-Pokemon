import { useState, useRef, useEffect } from "react";
import "./PokemonItem.css";
import { colours } from "../../data/colours";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import StatGrid from "../../StatGrid/StatGrid";
import { useTranslation } from "react-i18next";

function PokemonItem({
  evolutionLine,
  initialIndex,
  onAddForComparison,
  onRemoveFromComparison,
  selectedPokemons,
  onShowDetails,
}) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [showPrevTooltip, setShowPrevTooltip] = useState(false);
  const [showNextTooltip, setShowNextTooltip] = useState(false);
  const [showPrevFormTooltip, setShowPrevFormTooltip] = useState(false);
  const [showNextFormTooltip, setShowNextFormTooltip] = useState(false);
  const prevTooltipTimeoutRef = useRef(null);
  const nextTooltipTimeoutRef = useRef(null);
  const prevFormTooltipTimeoutRef = useRef(null);
  const nextFormTooltipTimeoutRef = useRef(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setCurrentFormIndex(0);
  }, [initialIndex, evolutionLine]);

  const handleNext = (event) => {
    event.stopPropagation();
    if (currentIndex < evolutionLine.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setCurrentFormIndex(0);
    }
  };

  const handlePrev = (event) => {
    event.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
      setCurrentFormIndex(0);
    }
  };

  const handleNextForm = (event) => {
    event.stopPropagation();
    const pokemon = evolutionLine[currentIndex];
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

  const handleShowDetails = (e) => {
    e.stopPropagation();
    onShowDetails({
      evolutionLine: evolutionLine,
      initialIndex: currentIndex,
      initialFormIndex: currentFormIndex,
    });
  };

  const pokemon = evolutionLine[currentIndex];
  const displayedPokemon = pokemon.varieties[currentFormIndex];
  const mainType = displayedPokemon.types[0].toLowerCase();
  const cardBackgroundColor = colours[mainType];
  const isSelected = selectedPokemons.some((p) => p.id === displayedPokemon.id);
  const hasMultipleForms = pokemon.varieties && pokemon.varieties.length > 1;

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
      onClick={handleShowDetails}
    >
      <div className="card-header">
        <div className="pokemon-measurements">
          <span className="measurement-tag">
            {t("height")}: {displayedPokemon.height / 10} m
          </span>
          <span className="measurement-tag">
            {t("weight")}: {displayedPokemon.weight / 10} kg
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

        <button className="details-toggle-button" onClick={handleShowDetails}>
          {t("showDescription")}
        </button>
      </div>
    </div>
  );
}

export default PokemonItem;

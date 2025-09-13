import { useState, useRef, useEffect } from "react";
import "./PokemonItem.css";
import { colours } from "../../data/colours";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { useTranslation } from "react-i18next";
import PokemonCardSkeleton from "./PokemonCardSkeleton/PokemonCardSkeleton";

function PokemonItem({
  evolutionLine,
  initialIndex,
  initialBranchIndex,
  onAddForComparison,
  onRemoveFromComparison,
  selectedPokemons,
  onShowDetails,
}) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [currentBranchIndex, setCurrentBranchIndex] = useState(
    initialBranchIndex || 0
  );
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const tooltipTimeoutRef = useRef(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setCurrentBranchIndex(initialBranchIndex || 0);
    setCurrentFormIndex(0);
  }, [initialIndex, initialBranchIndex, evolutionLine]);

  const currentStage = evolutionLine?.[currentIndex];
  const currentPokemonData = currentStage?.pokemons?.[currentBranchIndex];
  const displayedPokemon = currentPokemonData?.varieties?.[currentFormIndex];

  const handleMouseEnter = (tooltipId) => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setActiveTooltip(tooltipId);
    }, 500);
  };

  const handleMouseLeave = () => {
    clearTimeout(tooltipTimeoutRef.current);
    setActiveTooltip(null);
  };

  const renderTooltip = (tooltipId, text) => {
    return (
      <span
        className="evolution-tooltip-wrapper"
        onMouseEnter={() => handleMouseEnter(tooltipId)}
        onMouseLeave={handleMouseLeave}
      >
        {activeTooltip === tooltipId && (
          <span className="evolution-tooltip">{text}</span>
        )}
      </span>
    );
  };

  const handleNext = (event) => {
    event.stopPropagation();
    if (evolutionLine.length > 0 && currentIndex < evolutionLine.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setCurrentBranchIndex(0);
      setCurrentFormIndex(0);
    }
  };

  const handlePrev = (event) => {
    event.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
      setCurrentBranchIndex(0);
      setCurrentFormIndex(0);
    }
  };

  const handleNextBranch = (event) => {
    event.stopPropagation();
    const currentStage = evolutionLine[currentIndex];
    if (currentStage && currentBranchIndex < currentStage.pokemons.length - 1) {
      setCurrentBranchIndex((prev) => prev + 1);
      setCurrentFormIndex(0);
    }
  };

  const handlePrevBranch = (event) => {
    event.stopPropagation();
    if (currentBranchIndex > 0) {
      setCurrentBranchIndex((prev) => prev - 1);
      setCurrentFormIndex(0);
    }
  };

  const handleNextForm = (event) => {
    event.stopPropagation();
    const pokemon = evolutionLine[currentIndex]?.pokemons[currentBranchIndex];
    if (pokemon && currentFormIndex < pokemon.varieties.length - 1) {
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
      initialBranchIndex: currentBranchIndex,
      initialFormIndex: currentFormIndex,
    });
  };

  if (!displayedPokemon) {
    return null;
  }

  const mainType = displayedPokemon.types[0].toLowerCase();
  const cardBackgroundColor = colours[mainType];
  const isSelected = selectedPokemons.some((p) => p.id === displayedPokemon.id);
  const hasMultipleForms = currentPokemonData.varieties.length > 1;
  const hasBranches = currentStage.pokemons.length > 1;

  // --- PERUBAHAN DIMULAI DI SINI ---
  // Terapkan kelas 'long-name' jika panjang nama lebih dari 10 karakter
  const nameClassName = displayedPokemon.name.length > 10 ? "long-name" : "";
  // --- PERUBAHAN BERAKHIR DI SINI ---

  const handleAddClick = (event) => {
    event.stopPropagation();
    if (isSelected) {
      onRemoveFromComparison(displayedPokemon);
    } else {
      onAddForComparison(displayedPokemon);
    }
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
              onMouseEnter={() => handleMouseEnter("prev")}
              onMouseLeave={handleMouseLeave}
            >
              <button onClick={handlePrev} disabled={currentIndex === 0}>
                <MdArrowBackIos className="evolution-icon" />
              </button>
              {activeTooltip === "prev" && (
                <span className="evolution-tooltip">{t("tooltipPrev")}</span>
              )}
            </span>
            <span>
              {currentIndex + 1} / {evolutionLine.length}
            </span>
            <span
              className="evolution-tooltip-wrapper"
              onMouseEnter={() => handleMouseEnter("next")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={handleNext}
                disabled={currentIndex === evolutionLine.length - 1}
              >
                <MdArrowForwardIos className="evolution-icon" />
              </button>
              {activeTooltip === "next" && (
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
      {/* Terapkan kelas CSS secara dinamis */}
      <h1 className={nameClassName} style={{ textTransform: "capitalize" }}>
        {displayedPokemon.name}
      </h1>
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

      {hasBranches && (
        <div className="evolution-controls branch-controls">
          <span
            className="evolution-tooltip-wrapper"
            onMouseEnter={() => handleMouseEnter("prevBranch")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={handlePrevBranch}
              disabled={currentBranchIndex === 0}
            >
              <MdArrowBackIos className="evolution-icon" />
            </button>
            {renderTooltip("prevBranch", t("tooltipPrevBranch"))}
          </span>
          <span>
            {t("branch")} {currentBranchIndex + 1} /{" "}
            {currentStage.pokemons.length}
          </span>
          <span
            className="evolution-tooltip-wrapper"
            onMouseEnter={() => handleMouseEnter("nextBranch")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={handleNextBranch}
              disabled={currentBranchIndex === currentStage.pokemons.length - 1}
            >
              <MdArrowForwardIos className="evolution-icon" />
            </button>
            {renderTooltip("nextBranch", t("tooltipNextBranch"))}
          </span>
        </div>
      )}

      {hasMultipleForms && (
        <div className="evolution-controls bottom-controls">
          <span
            className="evolution-tooltip-wrapper"
            onMouseEnter={() => handleMouseEnter("prevForm")}
            onMouseLeave={handleMouseLeave}
          >
            <button onClick={handlePrevForm} disabled={currentFormIndex === 0}>
              <MdArrowBackIos className="evolution-icon" />
            </button>
            {renderTooltip("prevForm", t("tooltipPrevForm"))}
          </span>
          <span>
            {t("formsTitle")} {currentFormIndex + 1} /{" "}
            {currentPokemonData.varieties.length}
          </span>
          <span
            className="evolution-tooltip-wrapper"
            onMouseEnter={() => handleMouseEnter("nextForm")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={handleNextForm}
              disabled={
                currentFormIndex === currentPokemonData.varieties.length - 1
              }
            >
              <MdArrowForwardIos className="evolution-icon" />
            </button>
            {renderTooltip("nextForm", t("tooltipNextForm"))}
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

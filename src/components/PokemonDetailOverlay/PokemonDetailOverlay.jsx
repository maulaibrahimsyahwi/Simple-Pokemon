import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import { TbLayoutSidebarLeftExpand } from "react-icons/tb";
import { FaCodeCompare } from "react-icons/fa6";
import StatGrid from "../../StatGrid/StatGrid";
import { colours } from "../../data/colours";
import usePokemonData from "../../hooks/usePokemonData";
import { IoChevronForward } from "react-icons/io5";
import "./PokemonDetailOverlay.css";

function PokemonDetailOverlay({
  evolutionLine,
  initialIndex,
  initialBranchIndex,
  initialFormIndex,
  onClose,
  selectedPokemons,
  onAddForComparison,
  onRemoveFromComparison,
  onGoToCompare,
}) {
  const { t } = useTranslation();
  const { fetchWeaknesses, fetchLocations } = usePokemonData();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [currentBranchIndex, setCurrentBranchIndex] =
    useState(initialBranchIndex);
  const [currentFormIndex, setCurrentFormIndex] = useState(initialFormIndex);
  const [relations, setRelations] = useState({
    weaknesses: [],
    resistances: [],
    immunities: [],
  });
  const [pokemonLocations, setPokemonLocations] = useState([]);
  const [showAllLocations, setShowAllLocations] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);
  const formSliderRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (evolutionLine && evolutionLine.length > 0) {
      setCurrentIndex(initialIndex);
      setCurrentBranchIndex(initialBranchIndex);
      setCurrentFormIndex(initialFormIndex);
    }
  }, [evolutionLine, initialIndex, initialBranchIndex, initialFormIndex]);

  useEffect(() => {
    const fetchOverlayData = async () => {
      if (
        evolutionLine &&
        evolutionLine.length > 0 &&
        evolutionLine[currentIndex] &&
        evolutionLine[currentIndex].pokemons[currentBranchIndex]
      ) {
        const pokemon =
          evolutionLine[currentIndex].pokemons[currentBranchIndex].varieties[
            currentFormIndex
          ];
        const weaknesses = await fetchWeaknesses(pokemon.types);
        const locations = await fetchLocations(pokemon.id);
        setRelations(weaknesses);
        setPokemonLocations(locations);
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
    };

    fetchOverlayData();

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [
    evolutionLine,
    currentIndex,
    currentBranchIndex,
    currentFormIndex,
    fetchWeaknesses,
    fetchLocations,
  ]);

  if (
    !evolutionLine ||
    evolutionLine.length === 0 ||
    !evolutionLine[currentIndex] ||
    !evolutionLine[currentIndex].pokemons[currentBranchIndex]
  ) {
    return null;
  }

  const currentStage = evolutionLine[currentIndex];
  const pokemonData = currentStage.pokemons[currentBranchIndex];
  const displayedPokemon = pokemonData.varieties[currentFormIndex];

  const hasMultipleForms =
    pokemonData.varieties && pokemonData.varieties.length > 1;
  const showFormsInSlider =
    hasMultipleForms && pokemonData.varieties.length > 3;
  const locationsToShow = showAllLocations
    ? pokemonLocations
    : pokemonLocations.slice(0, 8);
  const hasMoreLocations = pokemonLocations.length > 8;

  // --- LOGIKA BARU UNTUK KONTROL TAMPILAN CABANG ---
  let branchDisplayStage = null;
  let branchSourceStageIndex = -1;

  const nextStage = evolutionLine[currentIndex + 1];
  if (nextStage && nextStage.pokemons.length > 1) {
    branchDisplayStage = nextStage;
    branchSourceStageIndex = currentIndex;
  } else if (currentIndex > 0) {
    const currentStageIsBranch =
      evolutionLine[currentIndex].pokemons.length > 1;
    if (currentStageIsBranch) {
      branchDisplayStage = evolutionLine[currentIndex];
      branchSourceStageIndex = currentIndex - 1;
    }
  }
  const hasBranchesToDisplay = branchDisplayStage !== null;
  // --- BATAS AKHIR LOGIKA BARU ---

  const scrollForms = (direction) => {
    if (formSliderRef.current) {
      const scrollAmount = formSliderRef.current.offsetWidth;
      if (direction === "left") {
        formSliderRef.current.scrollLeft -= scrollAmount;
      } else {
        formSliderRef.current.scrollLeft += scrollAmount;
      }
    }
  };

  const handleToggleLocations = () => {
    setShowAllLocations(!showAllLocations);
  };

  const isSelected = selectedPokemons.some((p) => p.id === displayedPokemon.id);

  const buttonAction = () => {
    if (selectedPokemons.length === 2) {
      onGoToCompare();
    } else if (isSelected) {
      onRemoveFromComparison(displayedPokemon);
    } else {
      onAddForComparison(displayedPokemon);
    }
  };

  const buttonText = () => {
    if (selectedPokemons.length === 2) {
      return isMobile ? <FaCodeCompare /> : t("compareButton");
    } else if (isSelected) {
      return isMobile ? <FaCodeCompare /> : t("removeFromCompare");
    } else {
      return isMobile ? <FaCodeCompare /> : t("addToCompare");
    }
  };

  return (
    <div className="pokemon-detail-overlay-backdrop open" onClick={onClose}>
      <div
        className="pokemon-detail-overlay open"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overlay-main-container">
          <div className="overlay-buttons-container">
            <button className="details-close-button" onClick={onClose}>
              {isMobile ? <TbLayoutSidebarLeftExpand /> : t("hideDescription")}
            </button>
            <button
              className={`add-to-compare-button ${
                isSelected && selectedPokemons.length < 2 ? "remove" : ""
              }`}
              onClick={buttonAction}
            >
              {buttonText()} ({selectedPokemons.length}/2)
            </button>
          </div>

          <div className="evolution-and-forms-container">
            {evolutionLine.length > 1 && (
              <div className="evolution-line-container">
                <h3>{t("evolutionTitle")}</h3>
                <div className="evolution-items-wrapper">
                  {evolutionLine.map((stage, index) => {
                    const firstPokemonOfStage = stage.pokemons[0];
                    const representativePokemon =
                      firstPokemonOfStage.varieties[0];
                    return (
                      <React.Fragment key={representativePokemon.id || index}>
                        <div
                          className={`evolution-item ${
                            index === currentIndex ? "active" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentIndex(index);
                            setCurrentBranchIndex(0);
                            setCurrentFormIndex(0);
                          }}
                        >
                          <img
                            src={representativePokemon.imageUrl}
                            alt={representativePokemon.name}
                          />
                          <span>{representativePokemon.name}</span>
                        </div>
                        {index < evolutionLine.length - 1 && (
                          <IoChevronForward className="evolution-arrow" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {hasMultipleForms && !showFormsInSlider && (
              <div className="pokemon-forms-container">
                <h3>{t("formsTitle")}</h3>
                <div className="form-items-wrapper">
                  {pokemonData.varieties.map((form, index) => (
                    <div
                      key={form.id || index}
                      className={`form-item ${
                        index === currentFormIndex ? "active" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentFormIndex(index);
                      }}
                    >
                      <img src={form.imageUrl} alt={form.name} />
                      <span>{form.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {showFormsInSlider && (
            <div className="pokemon-forms-slider-container">
              <h3>{t("formsTitle")}</h3>
              <div className="form-slider-wrapper">
                <button
                  className="slider-button left"
                  onClick={() => scrollForms("left")}
                >
                  <MdArrowBackIos />
                </button>
                <div className="form-items-wrapper slider" ref={formSliderRef}>
                  {pokemonData.varieties.map((form, index) => (
                    <div
                      key={form.id || index}
                      className={`form-item ${
                        index === currentFormIndex ? "active" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentFormIndex(index);
                      }}
                    >
                      <img src={form.imageUrl} alt={form.name} />
                      <span>{form.name}</span>
                    </div>
                  ))}
                </div>
                <button
                  className="slider-button right"
                  onClick={() => scrollForms("right")}
                >
                  <MdArrowForwardIos />
                </button>
              </div>
            </div>
          )}

          {hasBranchesToDisplay && (
            <div className="pokemon-branches-container">
              <h3>{t("branchesTitle")}</h3>
              <div className="branch-items-wrapper">
                {branchDisplayStage.pokemons.map(
                  (branchPokemon, branchIndex) => {
                    const representativePokemon = branchPokemon.varieties[0];
                    const isActiveBranch =
                      branchSourceStageIndex + 1 === currentIndex &&
                      branchIndex === currentBranchIndex;

                    return (
                      <div
                        key={representativePokemon.id}
                        className={`branch-item ${
                          isActiveBranch ? "active" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentIndex(branchSourceStageIndex + 1);
                          setCurrentBranchIndex(branchIndex);
                          setCurrentFormIndex(0);
                        }}
                      >
                        <img
                          src={representativePokemon.imageUrl}
                          alt={representativePokemon.name}
                        />
                        <span>{representativePokemon.name}</span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          <div className="overlay-content-area">
            <div className="main-info-container">
              <span className="measurement-tag height-tag">
                {t("height")} {displayedPokemon.height / 10} m
              </span>
              <img
                src={displayedPokemon.imageUrl}
                alt={displayedPokemon.name}
                className="overlay-image"
              />
              <span className="measurement-tag weight-tag">
                {t("weight")} {displayedPokemon.weight / 10} kg
              </span>
            </div>

            <h1 style={{ textTransform: "capitalize" }}>
              {displayedPokemon.name}
            </h1>

            <div className="overlay-description-box">
              <h3>{t("descriptionTitle")}</h3>
              <p>{displayedPokemon.description}</p>
            </div>

            {displayedPokemon.stats && (
              <div className="overlay-stats-box">
                <h3>{t("winnerBreakdownTitle")}</h3>
                <StatGrid stats={displayedPokemon.stats} />
              </div>
            )}

            <div className="grid-section">
              <div className="box">
                <h3>{t("typeTitle")}</h3>
                <div className="types-container">
                  {displayedPokemon.types.length > 0 ? (
                    displayedPokemon.types.map((type, index) => (
                      <span
                        key={index}
                        className="type-badge"
                        style={{ backgroundColor: colours[type.toLowerCase()] }}
                      >
                        {t(type.charAt(0).toUpperCase() + type.slice(1))}
                      </span>
                    ))
                  ) : (
                    <p>{t("noInfoFound")}</p>
                  )}
                </div>
              </div>
              <div className="box">
                <h3>{t("weaknessesTitle")}</h3>
                <div className="weakness-badges">
                  {relations.weaknesses.length > 0 ? (
                    relations.weaknesses.map((w, i) => (
                      <span
                        key={i}
                        className="weakness-badge"
                        style={{ backgroundColor: colours[w.toLowerCase()] }}
                      >
                        {t(w.charAt(0).toUpperCase() + w.slice(1))}
                      </span>
                    ))
                  ) : (
                    <p>{t("noInfoFound")}</p>
                  )}
                </div>
              </div>
              <div className="box">
                <h3>{t("resistancesTitle")}</h3>
                <div className="weakness-badges">
                  {relations.resistances.length > 0 ? (
                    relations.resistances.map((r, i) => (
                      <span
                        key={i}
                        className="weakness-badge"
                        style={{ backgroundColor: colours[r.toLowerCase()] }}
                      >
                        {t(r.charAt(0).toUpperCase() + r.slice(1))}
                      </span>
                    ))
                  ) : (
                    <p>{t("noInfoFound")}</p>
                  )}
                </div>
              </div>
              <div className="box">
                <h3>{t("immunitiesTitle")}</h3>
                <div className="weakness-badges">
                  {relations.immunities.length > 0 ? (
                    relations.immunities.map((i, idx) => (
                      <span
                        key={idx}
                        className="weakness-badge"
                        style={{ backgroundColor: colours[i.toLowerCase()] }}
                      >
                        {t(i.charAt(0).toUpperCase() + i.slice(1))}
                      </span>
                    ))
                  ) : (
                    <p>{t("noInfoFound")}</p>
                  )}
                </div>
              </div>
            </div>

            {pokemonLocations.length > 0 && (
              <div className="box full-width">
                <h3>{t("locationTitle")}</h3>
                <div className="location-list">
                  {locationsToShow.map((loc, index) => (
                    <span key={index} className="location-item">
                      {loc}
                    </span>
                  ))}
                </div>
                {hasMoreLocations && (
                  <button
                    className="location-toggle-button"
                    onClick={handleToggleLocations}
                  >
                    {showAllLocations
                      ? t("hideLocations")
                      : t("showAllLocations")}
                  </button>
                )}
              </div>
            )}
            {pokemonLocations.length === 0 && (
              <div className="box full-width">
                <h3>{t("locationTitle")}</h3>
                <p>{t("noLocationFound")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PokemonDetailOverlay;

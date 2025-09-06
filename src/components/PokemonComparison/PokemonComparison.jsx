import React, { useState, useEffect } from "react";
import "./PokemonComparison.css";
import { useTranslation } from "react-i18next";
import { colours } from "../../data/colours";
import StatProgressBar from "../StatProgressBar/StatProgressBar";
import { IoChevronForward, IoChevronBack } from "react-icons/io5";
import usePokemonData from "../../hooks/usePokemonData";

function PokemonComparison({ selectedPokemons }) {
  const { t } = useTranslation();
  // Menggunakan dua state terpisah untuk setiap slider
  const [showPokemon1Weaknesses, setShowPokemon1Weaknesses] = useState(false);
  const [showPokemon2Weaknesses, setShowPokemon2Weaknesses] = useState(false);

  const [pokemon1Relations, setPokemon1Relations] = useState({
    weaknesses: [],
    resistances: [],
    immunities: [],
  });
  const [pokemon2Relations, setPokemon2Relations] = useState({
    weaknesses: [],
    resistances: [],
    immunities: [],
  });
  const { fetchWeaknesses } = usePokemonData();

  useEffect(() => {
    if (selectedPokemons.length === 2) {
      const fetchAllRelations = async () => {
        const types1 = selectedPokemons[0].types;
        const types2 = selectedPokemons[1].types;

        const relations1 = await fetchWeaknesses(types1);
        const relations2 = await fetchWeaknesses(types2);

        setPokemon1Relations(relations1);
        setPokemon2Relations(relations2);
      };

      if (typeof fetchWeaknesses === "function") {
        fetchAllRelations();
      }
    }
  }, [selectedPokemons, fetchWeaknesses]);

  if (selectedPokemons.length < 2) {
    return (
      <div className="comparison-container empty-state">
        <h2>{t("comparisonTitle")}</h2>
        <p>{t("comparisonMessage")}</p>
      </div>
    );
  }

  const pokemon1 = selectedPokemons[0];
  const pokemon2 = selectedPokemons[1];

  const calculateTotalStats = (pokemon) => {
    if (!pokemon.stats) return 0;
    return Object.values(pokemon.stats).reduce(
      (total, stat) => total + stat,
      0
    );
  };

  const totalStats1 = calculateTotalStats(pokemon1);
  const totalStats2 = calculateTotalStats(pokemon2);

  const winner =
    totalStats1 > totalStats2
      ? pokemon1
      : totalStats2 > totalStats1
      ? pokemon2
      : null;

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
    <div className="comparison-container">
      <div className="comparison-header">
        <h1>{t("comparisonTitle")}</h1>
      </div>
      <div className="comparison-wrapper">
        <div className="comparison-main-content">
          <div
            className={`pokemon-card-comparison ${
              winner && winner.id === pokemon1.id ? "winner" : ""
            }`}
            style={{
              backgroundColor: `${colours[pokemon1.types[0].toLowerCase()]}aa`,
            }}
          >
            <img src={pokemon1.imageUrl} alt={pokemon1.name} />
            <h1>{pokemon1.name}</h1>
            <div className="types-container">
              {pokemon1.types.map((type, index) => (
                <span
                  key={index}
                  className="type-badge"
                  style={{ backgroundColor: colours[type.toLowerCase()] }}
                >
                  {type}
                </span>
              ))}
            </div>
            <div className="measurements-container">
              <p>
                <strong>{t("height")}</strong>: {pokemon1.height / 10} m
              </p>
              <p>
                <strong>{t("weight")}</strong>: {pokemon1.weight / 10} kg
              </p>
            </div>

            <div className="slider-container">
              <button
                className="slider-button"
                onClick={() => setShowPokemon1Weaknesses(false)}
                disabled={!showPokemon1Weaknesses}
              >
                <IoChevronBack />
              </button>
              <div
                className={`slider-content ${
                  showPokemon1Weaknesses ? "show-weaknesses" : ""
                }`}
              >
                <div className="stats-section">
                  <h3 className="section-title">Base Stats</h3>
                  {renderStats(pokemon1)}
                </div>
                <div className="weakness-section">
                  <h3 className="section-title">Weaknesses</h3>
                  <div className="weakness-badges">
                    {pokemon1Relations.weaknesses.map((weakness, index) => (
                      <span
                        key={index}
                        className="weakness-badge"
                        style={{
                          backgroundColor: colours[weakness.toLowerCase()],
                        }}
                      >
                        {weakness}
                      </span>
                    ))}
                  </div>
                  <h3 className="section-title">Resistances</h3>
                  <div className="weakness-badges">
                    {pokemon1Relations.resistances.map((resistance, index) => (
                      <span
                        key={index}
                        className="weakness-badge"
                        style={{
                          backgroundColor: colours[resistance.toLowerCase()],
                        }}
                      >
                        {resistance}
                      </span>
                    ))}
                  </div>
                  {pokemon1Relations.immunities.length > 0 && (
                    <>
                      <h3 className="section-title">Immunities</h3>
                      <div className="weakness-badges">
                        {pokemon1Relations.immunities.map((immunity, index) => (
                          <span
                            key={index}
                            className="weakness-badge"
                            style={{
                              backgroundColor: colours[immunity.toLowerCase()],
                            }}
                          >
                            {immunity}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <button
                className="slider-button"
                onClick={() => setShowPokemon1Weaknesses(true)}
                disabled={showPokemon1Weaknesses}
              >
                <IoChevronForward />
              </button>
            </div>
          </div>

          <div className="vs-text-desktop">VS</div>

          <div
            className={`pokemon-card-comparison ${
              winner && winner.id === pokemon2.id ? "winner" : ""
            }`}
            style={{
              backgroundColor: `${colours[pokemon2.types[0].toLowerCase()]}aa`,
            }}
          >
            <img src={pokemon2.imageUrl} alt={pokemon2.name} />
            <h1>{pokemon2.name}</h1>
            <div className="types-container">
              {pokemon2.types.map((type, index) => (
                <span
                  key={index}
                  className="type-badge"
                  style={{ backgroundColor: colours[type.toLowerCase()] }}
                >
                  {type}
                </span>
              ))}
            </div>
            <div className="measurements-container">
              <p>
                <strong>{t("height")}</strong>: {pokemon2.height / 10} m
              </p>
              <p>
                <strong>{t("weight")}</strong>: {pokemon2.weight / 10} kg
              </p>
            </div>

            <div className="slider-container">
              <button
                className="slider-button"
                onClick={() => setShowPokemon2Weaknesses(false)}
                disabled={!showPokemon2Weaknesses}
              >
                <IoChevronBack />
              </button>
              <div
                className={`slider-content ${
                  showPokemon2Weaknesses ? "show-weaknesses" : ""
                }`}
              >
                <div className="stats-section">
                  <h3 className="section-title">Base Stats</h3>
                  {renderStats(pokemon2)}
                </div>
                <div className="weakness-section">
                  <h3 className="section-title">Weaknesses</h3>
                  <div className="weakness-badges">
                    {pokemon2Relations.weaknesses.map((weakness, index) => (
                      <span
                        key={index}
                        className="weakness-badge"
                        style={{
                          backgroundColor: colours[weakness.toLowerCase()],
                        }}
                      >
                        {weakness}
                      </span>
                    ))}
                  </div>
                  <h3 className="section-title">Resistances</h3>
                  <div className="weakness-badges">
                    {pokemon2Relations.resistances.map((resistance, index) => (
                      <span
                        key={index}
                        className="weakness-badge"
                        style={{
                          backgroundColor: colours[resistance.toLowerCase()],
                        }}
                      >
                        {resistance}
                      </span>
                    ))}
                  </div>
                  {pokemon2Relations.immunities.length > 0 && (
                    <>
                      <h3 className="section-title">Immunities</h3>
                      <div className="weakness-badges">
                        {pokemon2Relations.immunities.map((immunity, index) => (
                          <span
                            key={index}
                            className="weakness-badge"
                            style={{
                              backgroundColor: colours[immunity.toLowerCase()],
                            }}
                          >
                            {immunity}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <button
                className="slider-button"
                onClick={() => setShowPokemon2Weaknesses(true)}
                disabled={showPokemon2Weaknesses}
              >
                <IoChevronForward />
              </button>
            </div>
          </div>
        </div>
        <div className="winner-summary">
          <h2>{t("winnerTitle")}</h2>
          {winner ? (
            <>
              <h1 className="winner-name">{winner.name}</h1>
              <p className="winner-message">{t("winnerMessage")}</p>
              <div
                className="winner-badge"
                style={{
                  backgroundColor: colours[winner.types[0].toLowerCase()],
                }}
              >
                {t("winnerTitle")}
              </div>
              <p className="total-stats-info">
                <strong>{pokemon1.name}</strong> {totalStats1} vs {totalStats2}{" "}
                <strong>{pokemon2.name}</strong>
              </p>
              <div className="stats-breakdown">
                <h3>{t("winnerBreakdownTitle")}</h3>
                {Object.keys(pokemon1.stats).map((statName) => (
                  <StatProgressBar
                    key={statName}
                    statName={statName}
                    value1={pokemon1.stats[statName]}
                    value2={pokemon2.stats[statName]}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="tie-message">{t("tieMessage")}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PokemonComparison;

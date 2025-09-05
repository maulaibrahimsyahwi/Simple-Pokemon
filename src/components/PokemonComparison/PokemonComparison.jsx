import React from "react";
import "./PokemonComparison.css";
import { useTranslation } from "react-i18next";
import { colours } from "../../data/colours";

function PokemonComparison({ selectedPokemons }) {
  const { t } = useTranslation();

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

  const getWinningStats = () => {
    const statKeys = Object.keys(pokemon1.stats);
    return statKeys.map((statName) => {
      const stat1 = pokemon1.stats[statName];
      const stat2 = pokemon2.stats[statName];
      let winStatus = "tie";
      if (stat1 > stat2) {
        winStatus = "pokemon1";
      } else if (stat2 > stat1) {
        winStatus = "pokemon2";
      }

      return {
        statName,
        stat1,
        stat2,
        winStatus,
      };
    });
  };

  const winningStats = winner ? getWinningStats() : [];

  return (
    <div className="comparison-container">
      <div className="comparison-content-wrapper">
        <div className="pokemon-comparison-cards">
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
            <h3>Base Stats</h3>
            {renderStats(pokemon1)}
          </div>

          <div className="vs-text">VS</div>

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
            <h3>Base Stats</h3>
            {renderStats(pokemon2)}
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
                {winningStats.map((stat) => (
                  <div key={stat.statName} className="stat-row">
                    <span
                      className={`stat-value ${
                        stat.winStatus === "pokemon1" ? "winning" : ""
                      }`}
                    >
                      {stat.stat1}
                    </span>
                    <span className="stat-name">
                      {stat.statName.toUpperCase()}
                    </span>
                    <span
                      className={`stat-value ${
                        stat.winStatus === "pokemon2" ? "winning" : ""
                      }`}
                    >
                      {stat.stat2}
                    </span>
                  </div>
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

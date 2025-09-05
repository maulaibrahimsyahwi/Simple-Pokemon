import React from "react";
import "./PokemonComparison.css";
import { useTranslation } from "react-i18next";
import { colours } from "../../data/colours";

function PokemonComparison({ selectedPokemons, onClearComparison }) {
  const { t } = useTranslation();

  if (selectedPokemons.length < 2) {
    return (
      <div className="comparison-container empty-state">
        <h2>{t("comparisonTitle")}</h2>
        <p>{t("comparisonMessage")}</p>
        <button className="clear-button" onClick={onClearComparison}>
          {t("backButton")}
        </button>
      </div>
    );
  }

  const pokemon1 = selectedPokemons[0];
  const pokemon2 = selectedPokemons[1];

  const renderStats = (pokemon) => {
    if (!pokemon.stats) return null;
    return (
      <div className="stats-grid">
        {" "}
        {/* Ubah dari stats-container ke stats-grid */}
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
      <button className="clear-button" onClick={onClearComparison}>
        {t("backButton")}
      </button>
      <div className="pokemon-comparison-cards">
        <div
          className="pokemon-card-comparison"
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
          <h3>Base Stats</h3> {/* Tambahkan judul */}
          {renderStats(pokemon1)}
        </div>

        <div className="vs-text">VS</div>

        <div
          className="pokemon-card-comparison"
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
          <h3>Base Stats</h3> {/* Tambahkan judul */}
          {renderStats(pokemon2)}
        </div>
      </div>
    </div>
  );
}

export default PokemonComparison;

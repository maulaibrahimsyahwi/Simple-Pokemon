import { useState } from "react";
import "./PokemonItem.css";
import { colours } from "../../data/colours";

function PokemonItem({ evolutionLine }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDescription, setShowDescription] = useState(false);

  const handleNext = () => {
    setShowDescription(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % evolutionLine.length);
  };

  const handlePrev = () => {
    setShowDescription(false);
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + evolutionLine.length) % evolutionLine.length
    );
  };

  const toggleDescription = () => {
    setShowDescription((prev) => !prev);
  };

  const pokemon = evolutionLine[currentIndex];
  const mainType = pokemon.types[0].toLowerCase();
  const cardBackgroundColor = colours[mainType];

  return (
    <div
      className="pokemon-card"
      style={{
        backgroundColor: `${cardBackgroundColor}aa`,
      }}
    >
      <img src={pokemon.imageUrl} alt={pokemon.name} width={250} />
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

      {/* Tombol toggle utama yang selalu terlihat */}
      <button className="description-toggle-button" onClick={toggleDescription}>
        {showDescription ? "Sembunyikan Deskripsi" : "Lihat Deskripsi"}
      </button>

      <div className={`description-overlay ${showDescription ? "show" : ""}`}>
        <div className="description-content">
          <p>{pokemon.description}</p>

          {pokemon.stats && (
            <div className="stats-container">
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
                <span className="stat-value">
                  {pokemon.stats["special-attack"]}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-name sp-def">SP.DEF</span>
                <span className="stat-value">
                  {pokemon.stats["special-defense"]}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-name speed">SPEED</span>
                <span className="stat-value">{pokemon.stats["speed"]}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kontrol evolusi tetap di sini */}
      {evolutionLine.length > 1 && (
        <div className="evolution-controls">
          <button onClick={handlePrev}>&lt;</button>
          <span>
            {currentIndex + 1} / {evolutionLine.length}
          </span>
          <button onClick={handleNext}>&gt;</button>
        </div>
      )}
    </div>
  );
}

export default PokemonItem;

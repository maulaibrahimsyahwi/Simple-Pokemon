import { useState } from "react";
import "./PokemonItem.css";
import { colours } from "../../data/colours";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";

function PokemonItem({ evolutionLine }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDescription, setShowDescription] = useState(false);

  // --- PERUBAHAN DI SINI ---
  const handleNext = (event) => {
    event.stopPropagation(); // Hanya hentikan event bubbling, jangan tutup deskripsi
    setCurrentIndex((prevIndex) => (prevIndex + 1) % evolutionLine.length);
  };

  const handlePrev = (event) => {
    event.stopPropagation(); // Hanya hentikan event bubbling, jangan tutup deskripsi
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + evolutionLine.length) % evolutionLine.length
    );
  };
  // --- AKHIR PERUBAHAN ---

  const toggleDescription = () => {
    setShowDescription((prev) => !prev);
  };

  const handleButtonClick = (event) => {
    event.stopPropagation();
    toggleDescription();
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
      onClick={toggleDescription}
    >
      <div className="pokemon-measurements">
        <span className="measurement-tag">Tinggi: {pokemon.height / 10} m</span>
        <span className="measurement-tag">Berat: {pokemon.weight / 10} kg</span>
      </div>
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

      <button className="description-toggle-button" onClick={handleButtonClick}>
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

      {evolutionLine.length > 1 && (
        <div className="evolution-controls">
          <MdArrowBackIos onClick={handlePrev}>&lt;</MdArrowBackIos>
          <span>
            {currentIndex + 1} / {evolutionLine.length}
          </span>
          <MdArrowForwardIos onClick={handleNext}>&gt;</MdArrowForwardIos>
        </div>
      )}
    </div>
  );
}

export default PokemonItem;

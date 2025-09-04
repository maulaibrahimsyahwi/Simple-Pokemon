import { useState } from "react";
import "./PokemonItem.css";
import { colours } from "../../data/colours";

function PokemonItem({ evolutionLine }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % evolutionLine.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + evolutionLine.length) % evolutionLine.length
    );
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
            style={{
              backgroundColor: colours[type.toLowerCase()],
            }}
          >
            {type}
          </span>
        ))}
      </div>

      <p className="description">{pokemon.description}</p>

      {/* Kontrol slider akan muncul jika ada lebih dari 1 evolusi */}
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

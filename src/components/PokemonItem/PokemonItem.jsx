import { useState } from "react";
import "./PokemonItem.css";
import { colours } from "../../data/colours";

function PokemonItem({ evolutionLine }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDescription, setShowDescription] = useState(false); // State untuk visibilitas deskripsi

  // Fungsi untuk ke evolusi selanjutnya
  const handleNext = () => {
    setShowDescription(false); // Sembunyikan deskripsi saat ganti
    setCurrentIndex((prevIndex) => (prevIndex + 1) % evolutionLine.length);
  };

  // Fungsi untuk ke evolusi sebelumnya
  const handlePrev = () => {
    setShowDescription(false); // Sembunyikan deskripsi saat ganti
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + evolutionLine.length) % evolutionLine.length
    );
  };

  // Fungsi untuk menampilkan/menyembunyikan deskripsi
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

      {/* Tombol untuk toggle deskripsi */}
      <button className="description-toggle-button" onClick={toggleDescription}>
        {showDescription ? "Sembunyikan Deskripsi" : "Lihat Deskripsi"}
      </button>

      {/* Kontainer deskripsi yang muncul dari bawah */}
      <div className={`description-overlay ${showDescription ? "show" : ""}`}>
        <p className="description-content">{pokemon.description}</p>
      </div>

      {/* Kontrol slider evolusi */}
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

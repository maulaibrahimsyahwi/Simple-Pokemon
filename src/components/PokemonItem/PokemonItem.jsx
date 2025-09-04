import "./PokemonItem.css";
import { colours } from "../../data/colours";

function PokemonItem({ pokemon }) {
  // Ambil tipe pertama pokemon untuk dijadikan warna latar
  const mainType = pokemon.types[0].toLowerCase();
  // Ambil kode warna hex dari file colours.js
  const cardBackgroundColor = colours[mainType];

  return (
    <div
      className="pokemon-card"
      style={{
        // Terapkan warna latar yang sudah kita perbaiki
        // Tambahkan 'aa' di akhir untuk sedikit transparansi agar lebih bagus
        backgroundColor: `${cardBackgroundColor}aa`,
      }}
    >
      <img src={pokemon.imageUrl} alt={pokemon.name} width={250} />
      {/* Membuat huruf pertama nama menjadi kapital */}
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
    </div>
  );
}

export default PokemonItem;

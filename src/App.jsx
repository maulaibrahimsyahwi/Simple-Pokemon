import Pokemons from "./components/PokemonList/PokemonList";
import "./App.css"; // Impor file CSS yang baru

function App() {
  return (
    <div className="app-container">
      <h1>Simple Pokémon</h1>
      <Pokemons />
    </div>
  );
}

export default App;

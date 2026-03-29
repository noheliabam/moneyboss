import { useState, useEffect } from "react";

function App() {
  const [gastos, setGastos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/gastos")
      .then(res => res.json())
      .then(data => setGastos(data));
  }, []);

  const agregarGasto = async () => {
    await fetch("http://127.0.0.1:5000/gastos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nombre, cantidad })
    });

    window.location.reload();
  };

  return (
    <div>
      <h1>💰 MoneyBoss</h1>

      <input
        placeholder="Nombre"
        onChange={(e) => setNombre(e.target.value)}
      />

      <input
        placeholder="Cantidad"
        onChange={(e) => setCantidad(e.target.value)}
      />

      <button onClick={agregarGasto}>Agregar</button>

      <ul>
        {gastos.map((g, i) => (
          <li key={i}>{g.nombre} - {g.cantidad}€</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
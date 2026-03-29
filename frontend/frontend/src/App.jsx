import { useState, useEffect } from "react";

function App() {
  const [gastos, setGastos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");

  // Cargar gastos al iniciar
  useEffect(() => {
    cargarGastos();
  }, []);

  const cargarGastos = async () => {
    const res = await fetch("https://moneyboss-production.up.railway.app/gastos");
    const data = await res.json();
    setGastos(data);
  };

  const agregarGasto = async () => {
    if (!nombre || !cantidad) return;

    await fetch("https://moneyboss-production.up.railway.app/gastos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nombre, cantidad })
    });

    // limpiar inputs
    setNombre("");
    setCantidad("");

    // recargar lista sin refresh
    cargarGastos();
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>💰 MoneyBoss</h1>

      <input
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        style={{ marginRight: "10px" }}
      />

      <input
        placeholder="Cantidad"
        value={cantidad}
        onChange={(e) => setCantidad(e.target.value)}
        style={{ marginRight: "10px" }}
      />

      <button onClick={agregarGasto}>Agregar</button>

      <ul style={{ marginTop: "20px" }}>
        {gastos.map((g, i) => (
          <li key={i}>
            {g.nombre} - {g.cantidad}€
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
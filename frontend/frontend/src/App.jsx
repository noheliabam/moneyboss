import { useState, useEffect } from "react";

function App() {
  const [gastos, setGastos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");

  // 🆕 nuevos estados
  const [ingreso, setIngreso] = useState("");
  const [gastosFijos, setGastosFijos] = useState("");

  // 🧠 cálculos
  const disponible = ingreso - gastosFijos;
  const gastoDiario = disponible > 0 ? (disponible / 30).toFixed(2) : 0;
  const totalGastado = gastos.reduce((acc, g) => acc + parseFloat(g.cantidad), 0);

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

    setNombre("");
    setCantidad("");
    cargarGastos();
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>💰 MoneyBoss</h1>

      {/* 🆕 INGRESOS */}
      <input
        placeholder="Ingreso mensual"
        value={ingreso}
        onChange={(e) => setIngreso(e.target.value)}
        style={{ marginRight: "10px" }}
      />

      <input
        placeholder="Gastos fijos"
        value={gastosFijos}
        onChange={(e) => setGastosFijos(e.target.value)}
        style={{ marginRight: "10px" }}
      />

      {/* 🧠 RESULTADOS */}
      <h2>💰 Disponible: {disponible || 0}€</h2>
      <h2>📅 Puedes gastar hoy: {gastoDiario}€</h2>
      <h2>💸 Has gastado: {totalGastado.toFixed(2)}€</h2>

      <hr />

      {/* 🧾 GASTOS */}
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
import { useState, useEffect } from "react";

function App() {
  const [gastos, setGastos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");

  // 🆕 nuevos estados
  const [ingreso, setIngreso] = useState("");
  const [gastosFijos, setGastosFijos] = useState("");

  useEffect(() => {
  localStorage.setItem("ingreso", ingreso);
}, [ingreso]);

useEffect(() => {
  localStorage.setItem("gastosFijos", gastosFijos);
}, [gastosFijos]);

  // 🧠 cálculos
  const disponible = parseFloat(ingreso || 0) - parseFloat(gastosFijos || 0);
  const gastoDiario = disponible > 0 ? (disponible / 30).toFixed(2) : 0;
  const totalGastado = gastos.reduce(
    (acc, g) => acc + parseFloat(g.cantidad),
    0,
  );
  let estado = "green";

  if (totalGastado > disponible) {
    estado = "red";
  } else if (totalGastado > disponible * 0.7) {
    estado = "orange";
  }

  let mensaje = "";

  if (disponible <= 0) {
    mensaje = "💀 Estás en números rojos. No deberías gastar más.";
  } else if (totalGastado === 0) {
    mensaje = `🔥 Empieza bien. Hoy puedes gastar hasta ${gastoDiario}€`;
  } else if (estado === "green") {
    mensaje = `✅ Vas perfecto. Sigue así`;
  } else if (estado === "orange") {
    mensaje = `⚠️ Cuidado… estás al límite`;
  } else {
    mensaje = `🚨 Te pasaste. Ajusta YA si quieres llegar a fin de mes`;
  }
  useEffect(() => {
    cargarGastos();

    const ingresoGuardado = localStorage.getItem("ingreso");
    const gastosFijosGuardados = localStorage.getItem("gastosFijos");

    if (ingresoGuardado) setIngreso(ingresoGuardado);
    if (gastosFijosGuardados) setGastosFijos(gastosFijosGuardados);
  }, []);

  const cargarGastos = async () => {
    const res = await fetch(
      "https://moneyboss-production.up.railway.app/gastos",
    );
    const data = await res.json();
    setGastos(data);
  };

  const agregarGasto = async () => {
    if (!nombre || !cantidad) return;

    await fetch("https://moneyboss-production.up.railway.app/gastos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre, cantidad }),
    });

    setNombre("");
    setCantidad("");
    cargarGastos();
  };

  const reiniciarMes = async () => {
  // borrar gastos del backend (temporal)
  await fetch("https://moneyboss-production.up.railway.app/reset", {
    method: "DELETE"
  });

  // limpiar frontend
  setGastos([]);

  // limpiar datos guardados
  localStorage.removeItem("ingreso");
  localStorage.removeItem("gastosFijos");

  setIngreso("");
  setGastosFijos("");
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
      <h2 style={{ color: estado }}>
        💸 Has gastado: {totalGastado.toFixed(2)}€
      </h2>
      <h3>{mensaje}</h3>

      <hr />

      <button 
  onClick={reiniciarMes} 
  style={{ marginBottom: "20px", background: "red", color: "white" }}
>
  🔄 Nuevo mes
</button>

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

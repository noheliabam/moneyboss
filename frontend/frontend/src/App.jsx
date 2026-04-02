import { useState, useEffect } from "react";

function App() {
  const [gastos, setGastos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");

 const [ingreso, setIngreso] = useState(
  localStorage.getItem("ingreso") || ""
);

const [gastosFijos, setGastosFijos] = useState(
  localStorage.getItem("gastosFijos") || ""
);


  const getNombreMes = (mes) => {
  const [year, m] = mes.split("-");
  const fecha = new Date(year, m - 1);

  return fecha.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric"
  });
};

  const sonidoAlerta = new Audio("https://www.soundjay.com/button/beep-07.wav");

  // 📅 FECHA ACTUAL
  const hoy = new Date();
  const fechaTexto = hoy.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const mesActual = new Date().toISOString().slice(0, 7);

  // 💾 GUARDAR
  useEffect(() => {
    localStorage.setItem("ingreso", ingreso);
  }, [ingreso]);

  useEffect(() => {
    localStorage.setItem("gastosFijos", gastosFijos);
  }, [gastosFijos]);

  // 📥 CARGAR
  useEffect(() => {
    cargarGastos();

    const ingresoGuardado = localStorage.getItem("ingreso");
    const gastosFijosGuardados = localStorage.getItem("gastosFijos");

    if (ingresoGuardado) setIngreso(ingresoGuardado);
    if (gastosFijosGuardados) setGastosFijos(gastosFijosGuardados);
  }, []);

  const cargarGastos = async () => {
    const res = await fetch("http://127.0.0.1:5000/gastos");
    const data = await res.json();
    setGastos(data);
  };

  // 🧠 FILTRAR POR MES
const gastosMes = gastos.filter(g => !g.mes || g.mes === mesActual);

  const disponible =
    parseFloat(ingreso || 0) - parseFloat(gastosFijos || 0);

  const totalGastado = gastosMes.reduce(
    (acc, g) => acc + parseFloat(g.cantidad),
    0
  );

  const restante = disponible - totalGastado;

  const gastoDiarioReal = restante > 0 ? restante / 30 : 0;

  let estado = "green";

  if (totalGastado > disponible) estado = "red";
  else if (totalGastado > disponible * 0.7) estado = "orange";

  useEffect(() => {
    if (estado === "red") sonidoAlerta.play();
  }, [estado]);

  let mensaje = "";

  if (disponible <= 0) mensaje = "💀 Estás en números rojos";
  else if (restante <= 0) mensaje = "🚨 Ya no puedes gastar más";
  else if (estado === "green") mensaje = "✅ Vas bien";
  else if (estado === "orange") mensaje = "⚠️ Cuidado";
  else mensaje = "🚨 Te pasaste";

  // ➕ AGREGAR
  const agregarGasto = async () => {
    if (!nombre || !cantidad) return;

    await fetch("http://127.0.0.1:5000/gastos", {
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

  // ❌ ELIMINAR
 const eliminarGasto = async (id) => {
 await fetch(`http://127.0.0.1:5000/gastos/${id}`, {
    method: "DELETE"
  });

  // 🔥 actualizar sin pedir todo al backend
  setGastos((prev) => prev.filter(g => g.id !== id));
};

  // 🔄 RESET (NO borra ingreso)
  const reiniciarMes = async () => {
    await fetch("http://127.0.0.1:5000/reset", {
      method: "DELETE"
    });

    setGastos([]);
  };

  return (
    <div style={{
      maxWidth: "500px",
      margin: "50px auto",
      padding: "20px",
      borderRadius: "10px",
      background: "#fff",
      textAlign: "center"
    }}>
      <h1>💰 MoneyBoss</h1>

      <p style={{ color: "#666", marginBottom: "10px" }}>
  {new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  })}
</p>

      <h3 style={{ color: "#666" }}>📅 {fechaTexto}</h3>

      {/* INGRESOS */}
      <input
        placeholder="Ingreso mensual"
        value={ingreso}
        onChange={(e) => setIngreso(e.target.value)}
      />

      <input
        placeholder="Gastos fijos"
        value={gastosFijos}
        onChange={(e) => setGastosFijos(e.target.value)}
      />

      <h2>💰 Disponible: {disponible}€</h2>
      <h2>📅 Diario: {gastoDiarioReal.toFixed(2)}€</h2>
      <h2 style={{ color: estado }}>💸 {totalGastado.toFixed(2)}€</h2>
      <h3>{mensaje}</h3>

      <button onClick={reiniciarMes}>🔄 Nuevo mes</button>

      {/* BOTONES */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
        <button onClick={agregarGasto} style={{ background: "#FFC107" }}>
          Agregar
        </button>

        <a href="/stats">
          <button style={{ background: "#FFC107" }}>
            📊 Stats
          </button>
        </a>
      </div>

      {/* INPUTS */}
      <input
  placeholder="Nombre"
  value={nombre}
  onChange={(e) => setNombre(e.target.value)}
/>

<input
  placeholder="Cantidad"
  value={cantidad}
  onChange={(e) => setCantidad(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") agregarGasto();
  }}
/>

      {/* LISTA */}
      <ul>
       {gastosMes.map((g) => (
  <li key={g.id}>
    {g.nombre} - {g.cantidad}€

    <button
      onClick={() => eliminarGasto(g.id)}
      style={{
        marginLeft: "10px",
        background: "red",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
      }}
    >
      ❌
    </button>
  </li>
))}
      </ul>
    </div>
  );
}

export default App;